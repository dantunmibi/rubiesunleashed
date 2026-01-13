import { supabase } from "@/lib/supabase";
import ProjectsClient from "./ProjectsClient";

export async function generateMetadata({ params }) {
  // ✅ Await params in Metadata
  const { username } = await params;
  return {
    title: `${decodeURIComponent(username)}'s Projects | Rubies Unleashed`,
    description: `Browse games and apps created by ${username}.`,
  };
}

export default async function ProjectsPage({ params }) {
  // ✅ Await params in Page
  const { username } = await params;
  return <ProjectsClient username={username} />;
}