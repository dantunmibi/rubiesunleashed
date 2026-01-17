// ✅ ISR: Regenerate every hour, serve stale content while revalidating
export const revalidate = 3600; // 1 hour
// 

import { createServerClient } from '@/lib/supabase-server';
import ProfileClient from "./ProfileClient";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);
  
  const supabase = await createServerClient(); // ✅ Create server instance
  
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .ilike('username', decodedName)
    .single();

  const title = data?.display_name || decodedName;

  return {
    title: `${title} | Profile`,
    description: `Check out ${title}'s collection on Rubies Unleashed.`,
    openGraph: {
        title: `${title} | Profile`,
        description: `Check out ${title}'s collection on Rubies Unleashed.`,
    }
  };
}

export default function ProfilePage() {
  return <ProfileClient />;
}