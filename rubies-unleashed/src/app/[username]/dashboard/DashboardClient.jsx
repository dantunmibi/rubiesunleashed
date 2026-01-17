'use client';

import { useEffect, useLayoutEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import ModerationNotificationBanner from '@/components/moderation/ModerationNotificationBanner';
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase"; 
import { useToastContext } from '@/components/providers/ToastProvider';
import { useSessionGuard } from "@/hooks/useSessionGuard"; 
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay"; 
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { notifyProjectCreated } from '@/lib/projectNotifications';
import { 
  LayoutDashboard, Plus, Package, UploadCloud, Edit, Eye, 
  Search, Filter, Settings, Loader2, X, Terminal, AlertCircle, ArrowRight // ✅ Added icons
} from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG = {
  published: { 
    label: 'LIVE', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10', 
    dot: 'bg-emerald-500', 
    border: 'border-emerald-500/20'
  },
  draft: { 
    label: 'DRAFT', 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10', 
    dot: 'bg-amber-500', 
    border: 'border-amber-500/20'
  },
  archived: { 
    label: 'ARCHIVED', 
    color: 'text-slate-500', 
    bg: 'bg-slate-500/10', 
    dot: 'bg-slate-500', 
    border: 'border-slate-500/20'
  },
  banned: { 
    label: 'BANNED', 
    color: 'text-red-500', 
    bg: 'bg-red-500/10', 
    dot: 'bg-red-500', 
    border: 'border-red-500/20'
  },
  hidden: { 
    label: 'HIDDEN', 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10', 
    dot: 'bg-amber-500', 
    border: 'border-amber-500/20'
  }
};

export default function DashboardClient() {
  // ✅ GET needsDevNameSetup
  const { user, profile, loading: authLoading, getDeveloperName, needsDevNameSetup } = useAuth();
  const router = useRouter();
  const params = useParams(); 
  const { showToast } = useToastContext();

  // ✅ ADD: State to track if we've already shown the error
  const [hasShownRoleError, setHasShownRoleError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // ✅ USE SESSION GUARD HOOK
  const { showSessionError, checkSupabaseError, checkApiError, validateSession, triggerError } = useSessionGuard();
  
  const username = params?.username || user?.user_metadata?.username || 'user';

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [hiddenProjects, setHiddenProjects] = useState(new Set());
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [initializing, setInitializing] = useState(false);
  const titleInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auth Guard - redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ✅ FIX: Role Guard with single toast
  useEffect(() => {
    if (!authLoading && user && profile && !hasShownRoleError && !isRedirecting) {
      if (profile.role !== 'architect' && profile.role !== 'admin') {
        console.log('🚫 Non-architect attempting dashboard access');
        
        // Set flags to prevent multiple executions
        setHasShownRoleError(true);
        setIsRedirecting(true);
        
        showToast('Dashboard access requires Architect role', 'error');
        router.push(`/${username}`);
        return;
      }
    }
  }, [user, profile, authLoading, router, username, showToast, hasShownRoleError, isRedirecting]);

  // Focus modal input
  useLayoutEffect(() => {
    if (isCreateModalOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isCreateModalOpen]);

  // Safety Valve
  useEffect(() => {
    let timer;
    if (loadingProjects || initializing) {
        timer = setTimeout(() => {
            console.warn("Operation timed out (5s). Triggering session recovery.");
            setLoadingProjects(false);
            setInitializing(false);
            if (triggerError) triggerError();
        }, 5000); 
    }
    return () => clearTimeout(timer);
  }, [loadingProjects, initializing, triggerError]);

  // URL Check
  useEffect(() => {
    if (!user || authLoading) return;
    const correctUsername = user.user_metadata?.username;
    const currentUrlParam = params?.username ? decodeURIComponent(params.username) : null;

    if (correctUsername && currentUrlParam && correctUsername !== currentUrlParam) {
        console.warn(`URL Mismatch: ${currentUrlParam} -> ${correctUsername}`);
        router.replace(`/${correctUsername}/dashboard`);
    }
  }, [user, authLoading, params, router]);

  // Fetch Projects
  useEffect(() => {
    let isMounted = true;
    async function fetchProjects() {
        if (!user?.id) return; 
        try {
            setLoadingProjects(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });
            
            if (checkSupabaseError(error)) return;
            
            if (error) throw error;

            if (isMounted) setProjects(data || []);
        } catch (err) {
            console.error("Error fetching projects:", err.message || err);
            if (err.message !== "permission denied for table projects") {
                showToast("Failed to load projects", "error");
            }
        } finally {
            if (isMounted) setLoadingProjects(false);
        }
    }
    if (user && user.id) fetchProjects();
    return () => { isMounted = false; };
  }, [user, showToast, checkSupabaseError, refreshTrigger]);

// Fetch hidden content IDs
useEffect(() => {
  async function fetchHiddenContent() {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('hidden_content')
        .select('game_id');
      
      if (error) {
        console.error('Failed to fetch hidden content:', error);
        return;
      }
      
      const hiddenIds = new Set(data?.map(h => h.game_id) || []);
      setHiddenProjects(hiddenIds);
      
      console.log('🚫 Hidden projects:', Array.from(hiddenIds));
    } catch (err) {
      console.error('Error fetching hidden content:', err);
    }
  }
  
  if (user?.id) fetchHiddenContent();
}, [user?.id, refreshTrigger]); // Re-fetch when projects refresh

  // Refresh on Visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && !loadingProjects) {
        setRefreshTrigger(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, loadingProjects]);

  // Filtering
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(lowerQuery));
    }
    if (statusFilter !== 'all') {
        result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [projects, searchQuery, statusFilter]);

  // Create Handler
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const title = newProjectTitle.trim();
    if (!title) return;

    if (!(await validateSession())) return;

    setInitializing(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Use existing logic to get name, but fallback gracefully
        const developerName = getDeveloperName?.() || 
                             profile?.developer_name || 
                             profile?.display_name || 
                             profile?.username || 
                             'Unknown Developer';

        const res = await fetch('/api/projects/create', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ 
                title,
                developer: developerName
            })
        });
        if (checkApiError(res)) return;

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Creation failed");
        }

        const { project } = await res.json();
        notifyProjectCreated(project);
        showToast("Project initialized", "success");
        setIsCreateModalOpen(false);
        setNewProjectTitle("");
        router.push(`/${username}/dashboard/project/${project.id}/edit`);

      } catch (error) {
          console.error("Create error:", error);
          if (!showSessionError) showToast(error.message, "error");
      } finally {
          setInitializing(false);
      }
  };

  const stats = useMemo(() => ({
      total: projects.length,
      published: projects.filter(p => p.status === 'published').length,
      drafts: projects.filter(p => p.status === 'draft').length
  }), [projects]);

  if (authLoading || (loadingProjects && !showSessionError)) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-emerald-500/30">
      <BackgroundEffects />
      <Navbar />

      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <LayoutDashboard size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                        The <span className="text-emerald-500">Forge</span>
                    </h1>
                </div>
                <p className="text-slate-400 font-medium">Command Center active. Manage your deployed assets.</p>
            </div>
            
    <div className="flex gap-3">
        {/* New Public Portfolio Link */}
        <Link 
            href={`/${username}/projects`}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group border border-white/10"
        >
            <Eye size={16} className="group-hover:scale-110 transition-transform" />
            Public Portfolio
        </Link>
        
        <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 group"
        >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            Initialize Project
        </button>
    </div>
        </div>

        {/* ✅ ADD THIS: Moderation Notification Banner */}
        <ModerationNotificationBanner />

        {/* ✅ DEVELOPER NAME PROMPT */}
        {needsDevNameSetup && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-3 bg-amber-500/20 rounded-full text-amber-500 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-500 font-bold uppercase tracking-wide text-sm mb-1">
                Identity Profile Incomplete
              </h3>
              <p className="text-slate-400 text-sm">
                You haven't set your <strong>Developer/Studio Name</strong> yet. This name will appear on all your project pages.
              </p>
            </div>
            <Link 
              href="/settings?tab=architect" // ✅ ADD QUERY PARAM
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              Set Name <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Projects" value={stats.total} icon={Package} color="blue" delay={0} />
            <StatCard label="Live Deployed" value={stats.published} icon={UploadCloud} color="emerald" delay={100} />
            <StatCard label="Drafts Pending" value={stats.drafts} icon={Edit} color="amber" delay={200} />
        </div>

        {/* Inventory Control */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#161b2c]/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            {/* ... Existing Inventory UI ... */}
            <div className="flex items-center gap-2 text-white font-bold">
                 <Package size={18} className="text-emerald-500"/>
                 <span>Inventory</span>
                 <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-slate-300 ml-2">{filteredProjects.length}</span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                </div>
                
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950/50 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Live</option>
                        <option value="draft">Drafts</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Inventory Grid (Existing) */}
        <div className="bg-[#161b2c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 min-h-100">
            {/* ... Existing Grid Logic ... */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f131f]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package size={18} className="text-emerald-500"/> Projects
                </h3>
            </div>

            {loadingProjects ? (
                <div className="h-96 flex flex-col items-center justify-center p-20 text-slate-500">
                    <Loader2 className="animate-spin w-8 h-8 mb-4 text-emerald-500" />
                    <p>Loading Assets...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center p-20 text-slate-500">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                        <Package size={32} className="text-slate-600" />
                    </div>
                    <p className="mb-6 font-medium">No projects found.</p>
                    {projects.length === 0 && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-emerald-500 font-bold uppercase text-xs tracking-widest hover:text-emerald-400 transition-colors"
                        >
                            Initialize First Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col">
                    {filteredProjects.map((project) => {
                        const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
                        const isHidden = hiddenProjects.has(project.id);
                        return (
                            <div 
                                key={project.id} 
                                onClick={() => router.push(`/${username}/dashboard/project/${project.id}`)}
                                className="group relative p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 last:border-b-0 last:rounded-b-3xl"
                            >
                                {/* Left Border Accent */}
                                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-transparent group-hover:bg-emerald-500 transition-colors" />

                                {/* Image */}
                                <div className="w-full md:w-32 aspect-video bg-black rounded-lg overflow-hidden shrink-0 border border-white/10 relative shadow-lg">
                                    {project.cover_url ? (
                                        <img src={project.cover_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={project.title} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                                            <Package size={24} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

      {/* Info */}
      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h4 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
            {project.title}
          </h4>
          
          {/* ✅ ADD: Dual Status Badges */}
          <div className="flex gap-2 items-center">
            <span className={`self-center md:self-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}></span>
              {status.label}
            </span>
            
            {/* ✅ NEW: Hidden Badge (shows alongside status) */}
            {isHidden && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${STATUS_CONFIG.hidden.bg} ${STATUS_CONFIG.hidden.color} ${STATUS_CONFIG.hidden.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG.hidden.dot} animate-pulse`}></span>
                HIDDEN
              </span>
            )}
          </div>
        </div>
                                    
                                    {/* Multi-Platform Badges */}
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.download_links && project.download_links.length > 0 ? (
                                                project.download_links.map((link, i) => (
                                                    <span key={i} className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase text-[10px] font-bold text-slate-400">
                                                        {link.platform}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase flex items-center gap-1 text-[10px] text-slate-400">
                                                    {project.platform || 'No Platform'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <span className="flex items-center gap-1 text-slate-500 text-[10px] border-l border-white/10 pl-3">
                                            Updated: {new Date(project.updated_at).toLocaleDateString()}
                                        </span>
                                        {project.version && (
                                             <span className="text-slate-600 text-[10px] border-l border-white/10 pl-3">
                                                v{project.version}
                                            </span>
                                        )}
                                    </div>
                                </div>

{/* Actions */}
<div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
  {/* Preview - Always show it for now (simpler) */}
  <ActionLink 
    href={`/${username}/dashboard/project/${project.id}/preview`}
    icon={Eye} 
    label="Preview"
    color="slate"
  />

  {/* Edit */}
  <ActionLink 
    href={`/${username}/dashboard/project/${project.id}/edit`}
    icon={Edit} 
    label="Edit"
    color="slate"
  />
  
  {/* Cockpit */}
  <ActionLink 
    href={`/${username}/dashboard/project/${project.id}`}
    icon={Settings} 
    label="Cockpit"
    color="slate"
  />

  {/* Public View - Only for published */}
  {project.status === 'published' && (
    <ActionLink 
      href={`/view/${project.slug}`}
      icon={Eye} 
      label="Live"
      color="emerald"
      external
    />
  )}
</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

      </main>
      <Footer />

      {/* Initialize Project Modal (Existing) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
            <div className="bg-[#161b2c] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#0f131f] p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Terminal size={20} className="text-emerald-500" /> Initialize Project
                    </h2>
                    <button 
                        onClick={() => setIsCreateModalOpen(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCreateProject} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Project Codename / Title</label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={newProjectTitle}
                            onChange={(e) => setNewProjectTitle(e.target.value)}
                            placeholder="e.g. Project Chimera"
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-2">This will generate your unique slug.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!newProjectTitle.trim() || initializing}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {initializing ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* ✅ CLEAN SESSION ERROR OVERLAY */}
      <SessionErrorOverlay show={showSessionError} />

    </div>
  );
}

// Sub-Components
function StatCard({ label, value, icon: Icon, color, delay }) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10",
    };

    return (
        <div 
            className="bg-[#161b2c] border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-white/10 transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`p-4 rounded-xl border ${colors[color]} transition-transform group-hover:scale-110 shadow-lg`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-3xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">{value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function ActionLink({ href, icon: Icon, label, color, external }) {
    const baseClass = "p-2.5 rounded-lg transition-all active:scale-95 border";
    const colors = {
        slate: "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5 hover:border-white/10",
        emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/30",
    };

    return (
        <Link 
            href={href}
            target={external ? "_blank" : undefined}
            className={`${baseClass} ${colors[color]}`}
            title={label}
            aria-label={label}
        >
            <Icon size={18} />
        </Link>
    );
}