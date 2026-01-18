import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/emailService';

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get profile with archetype
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, archetype')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Send welcome email
    const result = await sendWelcomeEmail({
      to: user.email,
      username: profile.username,
      archetype: profile.archetype
    });

    return NextResponse.json({ 
      success: result.success,
      messageId: result.messageId 
    });

  } catch (error) {
    console.error('Welcome email API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}