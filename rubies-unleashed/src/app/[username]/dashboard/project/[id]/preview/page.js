import { notFound } from 'next/navigation';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';
import ViewClient from '@/components/store/ViewClient';
import PreviewBanner from '@/components/ui/PreviewBanner';
import { processSupabaseProject } from '@/lib/game-utils';

export default async function ProjectPreviewPage({ params }) {
  const { username, id } = await params;
  
  console.log('🔍 Preview request for:', { username, id });
  
  try {
    // ✅ Use your existing server client
    const supabase = await createServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ No user found:', authError?.message);
      notFound();
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Verify username matches
    const userUsername = user.user_metadata?.username;
    if (userUsername !== username) {
      console.log('❌ Username mismatch');
      notFound();
    }
    
    // ✅ Use admin client for project fetch
    const adminClient = createAdminClient();
    
    const { data: project, error } = await adminClient
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !project) {
      console.log('❌ Project not found:', error?.message);
      notFound();
    }
    
    // Verify ownership
    if (project.user_id !== user.id) {
      console.log('❌ Not owner');
      notFound();
    }
    
    console.log('✅ Project verified:', project.title);
    
    // Check if hidden
    const { data: hiddenContent } = await adminClient
      .from('hidden_content')
      .select('reason')
      .eq('game_id', id)
      .single();
    
    const isHidden = !!hiddenContent;
    
    // Check if banned
    let moderationReason = null;
    if (project.status === 'banned') {
      const { data: modAction } = await adminClient
        .from('moderation_actions')
        .select('reason, admin_username, created_at')
        .eq('project_id', id)
        .eq('action_type', 'ban')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      moderationReason = modAction;
    }
    
    const processedProject = processSupabaseProject(project);
    
    return (
    <div className="min-h-screen bg-background">
        <PreviewBanner 
        project={project}
        username={username}
        isHidden={isHidden}
        hiddenReason={hiddenContent?.reason}
        moderationReason={moderationReason}
        />
        
        <div className={isHidden || project.status === 'banned' ? 'pt-52' : 'pt-32'}>
        <ViewClient 
            slug={project.slug} 
            initialGame={processedProject} 
        />
        </div>
    </div>
    );
  } catch (error) {
    console.error('❌ Preview error:', error);
    notFound();
  }
}

export async function generateMetadata() {
  return {
    title: 'Preview Mode',
    robots: 'noindex, nofollow'
  };
}