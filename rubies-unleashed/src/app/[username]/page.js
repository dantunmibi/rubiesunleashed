// ✅ ISR: Regenerate every hour, serve stale content while revalidating
export const revalidate = 3600;

import { createServerClient } from '@/lib/supabase-server';
import ProfileClient from "./ProfileClient";

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
    title: `${title} | Profile`,
    description: data?.bio || `Check out ${title}'s collection on Rubies Unleashed.`,
    alternates: {
      canonical: `https://rubiesunleashed.app/${decodedName}`,
    },
    openGraph: {
      title: `${title} | Profile`,
      description: data?.bio || `Check out ${title}'s collection on Rubies Unleashed.`,
      url: `https://rubiesunleashed.app/${decodedName}`,
      type: 'profile',
      // ✅ OG image from avatar if available
      images: data?.avatar_url ? [{ url: data.avatar_url }] : [],
    },
  };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  // ✅ Fetch profile server-side for crawlers
  let initialProfile = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, cover_url, archetype, role, created_at, is_public_wishlist, profile_visibility')
      .ilike('username', decodedName)
      .single();

    if (data && data.profile_visibility !== 'private') {
      initialProfile = data;
    }
  } catch (err) {
    console.error('❌ Server-side profile prefetch failed:', err);
    // Fails silently — ProfileClient fetches client-side as fallback
  }

  return <ProfileClient initialProfile={initialProfile} />;
}