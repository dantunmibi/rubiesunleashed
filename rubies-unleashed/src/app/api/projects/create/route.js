import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/game-utils';
import { notifyProjectCreated } from '@/lib/projectNotifications';
import { sendForgeWelcomeEmail } from '@/lib/emailService'; // ✅ ADD

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Verify Auth Token
    const authHeader = request.headers.get('Authorization');
    console.log("👉 Auth Header:", authHeader ? "Present" : "Missing");
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Body
    const body = await request.json();
    const { title, developer } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    // 3. Generate Slug
    const slug = generateSlug(title);

    // 4. Insert Project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: title.trim(),
        developer: developer || 'Unknown Developer',
        slug,
        status: 'draft'
      })
      .select()
      .single();
      
    if (error) {
      // Retry once with new suffix
      if (error.code === '23505') {
        const retrySlug = generateSlug(title);
        
        const { data: retryProject, error: retryError } = await supabase
          .from('projects')
          .insert({ 
            user_id: user.id, 
            title: title.trim(), 
            developer: developer || 'Unknown Developer',
            slug: retrySlug, 
            status: 'draft' 
          })
          .select()
          .single();
        
        if (!retryError) {
          notifyProjectCreated(retryProject);
          
          // ✅ NEW: Check if first project & send Forge welcome
          await handleFirstProjectEmail(supabase, user.id, retryProject);
          
          return NextResponse.json({ project: retryProject }, { status: 201 });
        }
        
        return NextResponse.json({ error: 'Unable to generate unique slug' }, { status: 409 });
      }
      console.error('DB Insert Error:', error);
      throw error;
    }

    notifyProjectCreated(project);

    // ✅ NEW: Check if first project & send Forge welcome
    await handleFirstProjectEmail(supabase, user.id, project);

    return NextResponse.json({ project }, { status: 201 });

  } catch (error) {
    console.error('Create API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleFirstProjectEmail(supabase, userId, project) {
  console.log('🔥 === FORGE EMAIL HANDLER STARTED ===');
  console.log('   User ID:', userId);
  console.log('   Project:', project.title);
  
  try {
    // Get current profile state
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, forge_welcome_sent, username')
      .eq('id', userId)
      .single();

    console.log('📋 Profile state:', {
      username: profile?.username,
      role: profile?.role,
      forge_welcome_sent: profile?.forge_welcome_sent,
      error: profileError?.message
    });

    if (profileError || !profile) {
      console.error('❌ Failed to get profile:', profileError);
      return;
    }

    // ✅ NEW LOGIC: Check flag first
    if (profile.forge_welcome_sent) {
      console.log('ℹ️ Forge welcome already sent, skipping email');
      
      // Still promote to architect if needed (edge case handling)
      if (profile.role !== 'architect') {
        console.log('🔧 Promoting to architect (without email)');
        await supabase
          .from('profiles')
          .update({ role: 'architect' })
          .eq('id', userId);
      }
      
      return;
    }

    console.log('✅ First time becoming architect! Sending welcome email...');

    // Promote to architect if not already
    if (profile.role !== 'architect') {
      console.log('🎓 Promoting user to architect role');
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'architect' })
        .eq('id', userId);

      if (roleError) {
        console.error('❌ Failed to update role:', roleError);
        // Continue anyway - email is more important than role update
      }
    }

    // Get user email
    const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !authUser?.email) {
      console.error('❌ Failed to get user email:', userError);
      return;
    }

    console.log('📧 Sending Forge welcome email to:', authUser.email);

    // Send the email
    const emailResult = await sendForgeWelcomeEmail({
      to: authUser.email,
      username: profile.username,
      projectTitle: project.title,
      projectId: project.id
    });

    console.log('📬 Email result:', emailResult);

    if (emailResult.success) {
      // ✅ Mark as sent ONLY after successful email
      const { error: flagError } = await supabase
        .from('profiles')
        .update({ forge_welcome_sent: true })
        .eq('id', userId);

      if (flagError) {
        console.error('⚠️ Failed to set forge_welcome_sent flag:', flagError);
      } else {
        console.log('✅ Forge welcome email sent and flagged successfully');
      }
    } else {
      console.error('❌ Forge welcome email failed:', emailResult.error);
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR in handleFirstProjectEmail:', error);
    console.error('Stack:', error.stack);
  }
  
  console.log('🔥 === FORGE EMAIL HANDLER FINISHED ===');
}