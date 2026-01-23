'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase'; 
import ProjectEditor from '@/components/forge/ProjectEditor';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import { Loader2 } from 'lucide-react';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import SessionErrorOverlay from '@/components/ui/SessionErrorOverlay';

export default function EditProjectPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { username, id } = params;

  const { showSessionError, checkSupabaseError, triggerError } = useSessionGuard();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user?.user_metadata?.username && username && user.user_metadata.username !== username) {
       router.replace(`/${user.user_metadata.username}/dashboard/project/${id}/edit`);
    }
  }, [user, authLoading, username, id, router]);

  // 2. 5-Second Safety Valve
  useEffect(() => {
    const timer = setTimeout(() => {
        if (loading || authLoading) {
            console.warn("⚠️ Timeout (5s): Triggering Recovery");
            setLoading(false);
            if (triggerError) triggerError();
        }
    }, 10000);
    return () => clearTimeout(timer);
  }, [loading, authLoading, triggerError]);

  // 3. Fetch Project
  useEffect(() => {
    async function fetchProject() {
      if (!user || !id) return;
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        if (checkSupabaseError(error)) { setLoading(false); return; }
        if (error) throw error;
        if (data.user_id !== user.id) throw new Error("Unauthorized");
        setProject(data);
      } catch (err) {
        if (!showSessionError) router.push(`/${username}/dashboard`);
      } finally {
        setLoading(false);
      }
    }
    if (user && !authLoading) fetchProject();
  }, [user, authLoading, id, router, checkSupabaseError, showSessionError, username]);

  if ((authLoading || loading) && !showSessionError) {
    return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;
  }

  if (showSessionError) return <SessionErrorOverlay show={true} />;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-emerald-500/30">
      <BackgroundEffects />
      <Navbar />
      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        <div className="bg-transparent"><ProjectEditor project={project} mode="edit" /></div>
      </main>
      <Footer />
    </div>
  );
}