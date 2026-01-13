import { createAdminClient } from '@/lib/supabase-server';
import { processSupabaseProject } from '@/lib/game-utils';
import { generateJsonLd, generateMetaTags } from '@/lib/seo-utils';
import ViewClient from '@/components/store/ViewClient';
import { notFound } from 'next/navigation';

export default async function AdminPreviewPage({ params }) {
  const { slug } = await params;
  
  try {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    
    // Try to find any project (including banned)
    const { data: project, error } = await adminClient
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !project) {
      notFound();
    }
    
    const game = processSupabaseProject(project);
    const jsonLd = generateJsonLd(game);
    
    return (
      <>
        <div className="bg-red-900/20 border-b border-red-500/30 p-4 text-center">
          <p className="text-red-400 font-bold">
            ⚠️ ADMIN PREVIEW - Status: {project.status.toUpperCase()}
          </p>
        </div>
        
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        
        <ViewClient slug={slug} initialGame={game} />
      </>
    );
    
  } catch (error) {
    console.error('Admin preview error:', error);
    notFound();
  }
}