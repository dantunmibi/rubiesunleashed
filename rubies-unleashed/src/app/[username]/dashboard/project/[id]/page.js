  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter, useParams } from 'next/navigation';
  import { useAuth } from '@/components/providers/AuthProvider';
  import { supabase } from '@/lib/supabase';
  import ProjectCockpit from '@/components/forge/ProjectCockpit';
  import Navbar from '@/components/ui/Navbar';
  import Footer from '@/components/ui/Footer';
  import BackgroundEffects from "@/components/ui/BackgroundEffects";
  import { Loader2 } from 'lucide-react';
  import { useSessionGuard } from '@/hooks/useSessionGuard';
  import SessionErrorOverlay from '@/components/ui/SessionErrorOverlay';

  export default function ProjectCockpitPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const { username, id } = params;

    const { showSessionError, checkSupabaseError, triggerError } = useSessionGuard();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ ADD: Project update handler
    const handleProjectUpdate = (updatedProject) => {
      console.log('📝 Parent received project update:', updatedProject);
      setProject(updatedProject);
    };

    // ✅ ADD: Refresh project data
    const refreshProject = async () => {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (checkSupabaseError(error)) return;
        if (error) throw error;
        
        if (data.user_id !== user.id) {
          throw new Error("Unauthorized");
        }

        setProject(data);
        console.log('🔄 Project refreshed:', data);
      } catch (err) {
        console.error("Project refresh error:", err);
      }
    };

    // 1. Auth & Username Guard (unchanged)
    useEffect(() => {
      if (authLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      const currentUsername = user.user_metadata?.username;
      if (currentUsername && username && currentUsername !== username) {
        console.warn("Username mismatch. Redirecting.");
        router.replace(`/${currentUsername}/dashboard/project/${id}`);
      }
    }, [user, authLoading, username, id, router]);

    // 2. Fetch Project (unchanged)
    useEffect(() => {
      async function fetchProject() {
        if (!user || !id) return;

        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

          if (checkSupabaseError(error)) {
              setLoading(false);
              return;
          }

          if (error) throw error;
          
          if (data.user_id !== user.id) {
              throw new Error("Unauthorized");
          }

          setProject(data);
        } catch (err) {
          console.error("Cockpit Fetch Error:", err);
          if (!showSessionError) {
              router.push(`/${username}/dashboard`);
          }
        } finally {
          setLoading(false);
        }
      }

      if (user && !authLoading) {
          fetchProject();
      }
    }, [user, authLoading, id, router, checkSupabaseError, showSessionError, username]);

    // 3. Safety valve (unchanged)
    useEffect(() => {
      const timer = setTimeout(() => {
        if (loading || authLoading) {
          console.warn("⚠️ 5s Timeout Reached: Forcing Recovery UI");
          setLoading(false);
          triggerError();
        }
      }, 5000);

      return () => clearTimeout(timer);
    }, [loading, authLoading, triggerError]);

    if ((authLoading || loading) && !showSessionError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
      );
    }

    if (showSessionError) {
        return <SessionErrorOverlay show={true} />;
    }

    if (!project) return null;

    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-emerald-500/30">
        <BackgroundEffects />
        <Navbar />
        
        <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
            {/* ✅ UPDATED: Pass update handlers to child */}
            <ProjectCockpit 
              project={project} 
              onProjectUpdate={handleProjectUpdate}
              onRefreshProject={refreshProject}
            />
        </main>

        <Footer />
      </div>
    );
  }