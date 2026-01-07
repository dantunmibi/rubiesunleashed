import { supabase } from "@/lib/supabase";
import ProfileClient from "./ProfileClient";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  // Fetch Display Name for Title
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