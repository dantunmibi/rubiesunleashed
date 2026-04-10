import { createServerClient } from '@/lib/supabase-server';
import { processSupabaseProject } from '@/lib/game-utils';
import ProjectsClient from "./ProjectsClient";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .ilike('username', decodedName)
    .single();

  const title = data?.display_name || decodedName;

  return {
    title: `${title}'s Projects | Rubies Unleashed`,
    description: data?.bio || `Browse games and apps created by ${title} on Rubies Unleashed.`,
    alternates: {
      canonical: `https://rubiesunleashed.app/${decodedName}/projects`,
    },
    openGraph: {
      title: `${title}'s Projects | Rubies Unleashed`,
      description: data?.bio || `Browse games and apps created by ${title}.`,
      url: `https://rubiesunleashed.app/${decodedName}/projects`,
      images: data?.avatar_url ? [{ url: data.avatar_url }] : [],
    },
  };
}

export default async function ProjectsPage({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  let initialProfile = null;
  let initialProjects = [];

  try {
    const supabase = await createServerClient();

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', decodedName)
      .single();

    if (profileData && profileData.profile_visibility !== 'private') {
      initialProfile = profileData;

      // Fetch projects if architect
      if (profileData.role === 'architect' || profileData.role === 'admin') {
        const { data: projectsData } = await supabase
          .from('projects_public')
          .select('*')
          .eq('uploader_username', profileData.username)
          .order('created_at', { ascending: false });

        initialProjects = (projectsData || [])
          .map(processSupabaseProject)
          .filter(Boolean);
      }
    }
  } catch (err) {
    console.error('❌ Server-side projects prefetch failed:', err);
  }

  return (
    <ProjectsClient
      username={username}
      initialProfile={initialProfile}
      initialProjects={initialProjects}
    />
  );
}