import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard - The Forge',
  robots: 'noindex'
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }) {
  const { username } = await params;

  // ✅ SIMPLE: Let the client component handle all auth and role checks
  // The DashboardClient already has:
  // - Auth guards (useAuth hook)
  // - Role verification 
  // - Redirects for non-architects
  // - Session error handling
  
  return <DashboardClient username={username} />;
}