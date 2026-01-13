"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import {
  Loader2, ShieldAlert, Users, Flag, CheckCircle, XCircle, EyeOff, Trash2, Plus, RefreshCw, Activity,
  Star, Award, Sparkles // ✅ ADD THESE
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import NotFound from "@/app/not-found"; 
import ServiceGrid from "@/components/status/ServiceGrid";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { SERVICES } from "@/lib/status/services";


export default function AdminClient() {
  // ✅ AUTH GUARD: initialized added
  const { user, isAdmin, loading, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    if (isAdmin) document.title = "Admin Console | Rubies Unleashed";
  }, [isAdmin]);

  // ✅ 1. INITIALIZATION & LOADING STATE
  // Wait until Auth is settled.
  if (!initialized || loading) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
            <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      );
  }

  // ✅ 2. ACCESS DENIED (Stealth Mode)
  // Only show this AFTER initialization is complete.
  if (!user || !isAdmin) {
      return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-red-500/30">
      <Navbar />

      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30 text-red-500">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Admin Console</h1>
            <p className="text-slate-400 text-sm">System Oversight & Moderation</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
            <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")} icon={Flag} label="Reports" />
            <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={Users} label="Users" />
            <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={EyeOff} label="Content" />
            <TabButton active={activeTab === "migration"} onClick={() => setActiveTab("migration")} icon={Plus} label="Migration" />
            <TabButton active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={Activity} label="System" />
        </div>

        {/* Content (Conditional Rendering for Performance) */}
        <div className="bg-[#161b2c] border border-white/5 rounded-2xl p-6 min-h-125">
            {activeTab === 'reports' && <ReportManager />}
            {activeTab === 'users' && <UserManager />}
            {activeTab === 'content' && <ContentManager />}
            {activeTab === 'migration' && <BloggerMigration />}
            {activeTab === 'system' && <SystemManager />}
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
        active ? "border-red-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

// --- SUB-COMPONENTS ---

function ReportManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [projectSlugs, setProjectSlugs] = useState(new Map()); // ✅ ADD: Store ID -> slug mapping

  const fetchReports = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setReports(data || []);
        
        // ✅ ADD: Fetch slugs for Supabase project IDs
        await fetchProjectSlugs(data || []);
    } catch (error) {
        console.error("Reports Error:", error);
    } finally {
        setLoading(false);
    }
  };

// ✅ FIX: Better UUID detection
const fetchProjectSlugs = async (reports) => {
  const projectIds = reports
    .map(r => r.game_id)
    .filter(id => {
      // UUID format: 8-4-4-4-12 characters (36 total with hyphens)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return id && uuidRegex.test(id);
    });
  
  if (projectIds.length === 0) return;
  
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, slug')
      .in('id', projectIds);
    
    const slugMap = new Map();
    projects?.forEach(p => slugMap.set(p.id, p.slug));
    setProjectSlugs(slugMap);
  } catch (error) {
    console.error('Failed to fetch project slugs:', error);
  }
};

  const fetchHiddenStatus = async () => {
      const { data } = await supabase.from('hidden_content').select('game_id');
      setHiddenIds(new Set(data?.map(h => h.game_id) || []));
  };

  useEffect(() => { fetchReports(); fetchHiddenStatus(); }, []);

  // ✅ ADD: Helper to get correct view URL
  const getViewUrl = (gameId) => {
    // If we have a slug mapping, use it
    if (projectSlugs.has(gameId)) {
      return `/view/${projectSlugs.get(gameId)}`;
    }
    
    // For Blogger IDs or unknown, use the ID directly
    return `/view/${gameId}`;
  };

  const updateStatus = async (id, status) => {
    try {
        const { error } = await supabase.from("reports").update({ status }).eq("id", id);
        if (error) throw error;
        fetchReports(); 
    } catch (error) {
        alert("Update failed: " + error.message);
    }
  };

  // ✅ ADD: Delete report function
  const deleteReport = async (id) => {
    if (!confirm('Delete this report permanently?')) return;
    
    try {
        const { error } = await supabase.from("reports").delete().eq("id", id);
        if (error) throw error;
        
        // Remove from local state immediately
        setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
        alert("Delete failed: " + error.message);
    }
  };

  const toggleBan = async (gameId) => {
      if (hiddenIds.has(gameId)) {
          if (!confirm(`Unban ${gameId}?`)) return;
          await supabase.from('hidden_content').delete().eq('game_id', gameId);
          hiddenIds.delete(gameId);
      } else {
          if (!confirm(`Ban ${gameId}?`)) return;
          await supabase.from('hidden_content').insert({ game_id: gameId, reason: 'Admin Report' });
          hiddenIds.add(gameId);
      }
      setHiddenIds(new Set(hiddenIds)); 
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-10 text-red-500" />;
  if (reports.length === 0) return <p className="text-center text-slate-500 mt-10">No active reports.</p>;

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="flex flex-col md:flex-row gap-4 p-4 border border-white/5 rounded-xl bg-black/20">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                r.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {r.status}
              </span>
              <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <h4 className="font-bold text-white">{r.issue_type}</h4>
            <p className="text-sm text-slate-400 mt-1">{r.description || "No details provided."}</p>
            
            {/* ✅ UPDATE: Use correct URL */}
            <a 
              href={getViewUrl(r.game_id)} 
              target="_blank" 
              className="text-xs text-blue-400 hover:text-blue-300 mt-2 block font-mono underline"
            >
              View Content ({projectSlugs.has(r.game_id) ? projectSlugs.get(r.game_id) : r.game_id})
            </a>
          </div>
          
          {/* ✅ UPDATE: Add delete button */}
          <div className="flex gap-2 items-center">
            <button 
                onClick={() => toggleBan(r.game_id)} 
                className={`p-2 rounded hover:opacity-80 transition-colors ${hiddenIds.has(r.game_id) ? "bg-emerald-900/20 text-emerald-500" : "bg-red-900/20 text-red-500"}`}
                title={hiddenIds.has(r.game_id) ? "Unban" : "Ban Content"}
            >
                {hiddenIds.has(r.game_id) ? <RefreshCw size={18} /> : <EyeOff size={18} />}
            </button>
            
            <button 
                onClick={() => updateStatus(r.id, "resolved")} 
                className="p-2 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20" 
                title="Resolve"
            >
                <CheckCircle size={18} />
            </button>
            
            <button 
                onClick={() => updateStatus(r.id, "ignored")} 
                className="p-2 bg-slate-500/10 text-slate-500 rounded hover:bg-slate-500/20" 
                title="Ignore"
            >
                <XCircle size={18} />
            </button>
            
            {/* ✅ ADD: Delete button */}
            <button 
                onClick={() => deleteReport(r.id)} 
                className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20" 
                title="Delete Report"
            >
                <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (searchTerm = "") => {
    setLoading(true);
    try {
        let query = supabase.from("profiles").select("*").limit(50).order("created_at", { ascending: false });
        if (searchTerm) query = query.ilike("username", `%${searchTerm}%`);
        const { data, error } = await query;
        if (error) throw error;
        setUsers(data || []);
    } catch (error) {
        console.error("User Search Error:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const promoteUser = async (id) => {
    if (!confirm("Promote to Architect?")) return;
    const { error } = await supabase.from("profiles").update({ role: "architect", archetype: "architect" }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchUsers(search); // ✅ Refresh List
  };

  // ✅ New Demote Function
  const demoteUser = async (id) => {
    if (!confirm("Demote to User?")) return;
    const { error } = await supabase.from("profiles").update({ role: "user", archetype: "hunter" }).eq("id", id); // Reset to default archetype? Or keep current?
    // Safe bet: Reset role to user. Archetype can stay or reset.
    if (error) alert("Error: " + error.message);
    else fetchUsers(search);
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username..." className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white flex-1 focus:border-red-500 outline-none" />
        <button onClick={() => fetchUsers(search)} className="bg-white/10 px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-white/20">
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Search"}
        </button>
      </div>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-black/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white">
                    {u.avatar_url && u.avatar_url.startsWith('http') ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{u.username ? u.username[0].toUpperCase() : "?"}</span>}
                </div>
                <div>
                    <p className="font-bold text-white text-sm">{u.username}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{u.role} • {u.archetype}</p>
                </div>
            </div>
            {/* Action Buttons */}
{u.role === "user" && (
  <button 
    onClick={() => promoteUser(u.id)} 
    className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded hover:bg-emerald-500/20 font-bold uppercase"
  >
    Promote
  </button>
)}
            {/* ✅ Demote Button */}
            {u.role === "architect" && (
              <button onClick={() => demoteUser(u.id)} className="text-[10px] bg-red-500/10 text-red-500 px-3 py-1.5 rounded hover:bg-red-500/20 font-bold uppercase">
                Demote
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentManager() {
    const [hidden, setHidden] = useState([]);
    const [bannedProjects, setBannedProjects] = useState([]); // ✅ ADD
    const [manualId, setManualId] = useState("");
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [featuredTab, setFeaturedTab] = useState('hidden'); // Update options: 'hidden', 'featured', 'banned'

    const fetchHidden = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('hidden_content').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setHidden(data || []);
        } catch (error) {
            console.error("Hidden Content Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ ADD: Fetch banned projects
    const fetchBannedProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'banned')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            setBannedProjects(data || []);
        } catch (error) {
            console.error("Banned Projects Error:", error);
        } finally {
            setLoading(false);
        }
    };


    // ✅ ADD: Fetch projects for curation
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error("Projects fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchHidden(); 
        fetchProjects();
        fetchBannedProjects(); // ✅ ADD
    }, []);

    // ✅ ADD: Restore banned project
    const restoreProject = async (projectId) => {
        if (!confirm('Restore this project to published status?')) return;
        
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status: 'published' })
                .eq('id', projectId);
            
            if (error) throw error;
            fetchBannedProjects(); // Refresh banned list
            fetchProjects(); // Refresh published list
        } catch (error) {
            alert("Restore failed: " + error.message);
        }
    };

    // ✅ ADD: Toggle featured status
const toggleFeatured = async (projectId, currentStatus) => {
    console.log('🔧 Toggle Featured Debug:', {
        projectId,
        currentStatus,
        newStatus: !currentStatus
    });
    
    try {
        const nextOrder = !currentStatus ? Math.floor(Date.now() / 1000) : 0;
        
        console.log('📤 Sending update:', {
            is_featured: !currentStatus,
            featured_order: nextOrder
        });
        
        const { error, data } = await supabase
            .from('projects')
            .update({ 
                is_featured: !currentStatus,
                featured_order: nextOrder
            })
            .eq('id', projectId)
            .select(); // ✅ ADD: Return updated data
        
        console.log('📥 Update response:', { error, data });
        
        if (error) throw error;
        
        fetchProjects(); // Refresh list
    } catch (error) {
        console.error('❌ Toggle error:', error);
        alert("Feature toggle failed: " + error.message);
    }
};

    // ✅ ADD: Toggle editor's choice
    const toggleEditorsChoice = async (projectId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ is_editors_choice: !currentStatus })
                .eq('id', projectId);
            
            if (error) throw error;
            fetchProjects();
        } catch (error) {
            alert("Editor's choice toggle failed: " + error.message);
        }
    };

    const unhide = async (id) => {
        try {
            const { error } = await supabase.from('hidden_content').delete().eq('game_id', id);
            if (error) throw error;
            fetchHidden();
        } catch (error) {
            alert("Unhide failed: " + error.message);
        }
    };

const manualHide = async () => {
    if (!manualId.trim()) return;
    
    try {
        let gameIdToHide = manualId.trim();
        
        // ✅ NEW: If it looks like a slug, try to find the project ID
        if (manualId.includes('-') && manualId.length > 10) {
            console.log('🔍 Searching for project by slug:', manualId);
            
            // Try to find Supabase project by slug
            const { data: project, error } = await supabase
                .from('projects')
                .select('id, title, slug')
                .eq('slug', manualId)
                .single();
            
            if (project) {
                gameIdToHide = project.id;
                console.log('✅ Found Supabase project:', project.title, 'ID:', project.id);
            } else {
                console.log('❌ No Supabase project found, using as Blogger ID');
                // Keep original input as Blogger ID
            }
        }
        
        const { error: hideError } = await supabase
            .from('hidden_content')
            .insert({ 
                game_id: gameIdToHide, 
                reason: `Manual Admin Action (Input: ${manualId})` 
            });
        
        if (hideError) throw hideError;
        
        setManualId("");
        fetchHidden();
        
        console.log('✅ Successfully hidden:', gameIdToHide);
        
    } catch (error) {
        console.error('❌ Hide failed:', error);
        alert("Hide failed: " + error.message);
    }
};

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10 text-red-500" />;

    return (
        <div className="space-y-8">
            {/* ✅ UPDATE: Add banned tab */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setFeaturedTab('hidden')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${featuredTab === 'hidden' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Hidden Content
                </button>
                <button
                    onClick={() => setFeaturedTab('banned')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${featuredTab === 'banned' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Banned Projects
                </button>
                <button
                    onClick={() => setFeaturedTab('featured')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${featuredTab === 'featured' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Featured Content
                </button>
            </div>

            {/* ✅ ADD: Banned projects tab */}
            {featuredTab === 'banned' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <XCircle size={18} className="text-red-500" /> Auto-Flagged Projects ({bannedProjects.length})
                    </h3>
                    
                    {bannedProjects.length === 0 ? (
                        <p className="text-slate-500 text-sm">No banned projects.</p>
                    ) : (
                        <div className="space-y-3">
                            {bannedProjects.map(project => (
                                <div key={project.id} className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={project.cover_url || '/placeholder-game.png'} 
                                            className="w-16 h-20 object-cover rounded border border-red-500/30" 
                                            alt={project.title}
                                        />
                                        <div>
                                            <h4 className="font-bold text-white">{project.title}</h4>
                                            <p className="text-slate-400 text-sm">{project.developer}</p>
                                            <p className="text-red-400 text-xs mt-1">
                                                Banned: {new Date(project.updated_at).toLocaleDateString()}
                                            </p>
                                            <p className="font-mono text-xs text-slate-500 mt-1">
                                                ID: {project.id}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <a
                                          href={`/admin/preview/${project.slug}`} // ✅ Change this line
                                          target="_blank"
                                          className="p-2 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/40 border border-slate-600/30"
                                          title="Admin Preview"
                                        >
                                          <EyeOff size={16} />
                                        </a>
                                        
                                        <button
                                            onClick={() => restoreProject(project.id)}
                                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 border border-emerald-500/30 flex items-center gap-2"
                                            title="Restore to Published"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ✅ ADD: Featured content management */}
            {featuredTab === 'featured' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Sparkles size={18} /> Content Curation
                    </h3>
                    
                    <div className="space-y-3">
                        {projects.map(project => (
                            <div key={project.id} className="bg-black/20 border border-white/5 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={project.cover_url || '/placeholder-game.png'} 
                                        className="w-16 h-20 object-cover rounded border border-white/10" 
                                        alt={project.title}
                                    />
                                    <div>
                                        <h4 className="font-bold text-white">{project.title}</h4>
                                        <p className="text-slate-400 text-sm">{project.developer}</p>
                                        <div className="flex gap-2 mt-1">
                                            {project.is_featured && (
                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                                                    FEATURED
                                                </span>
                                            )}
                                            {project.is_editors_choice && (
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                                                    EDITOR'S CHOICE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleFeatured(project.id, project.is_featured)}
                                        className={`p-2 rounded transition-colors ${
                                            project.is_featured 
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                                : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                                        }`}
                                        title="Toggle Featured"
                                    >
                                        <Star size={16} />
                                    </button>
                                    
                                    <button
                                        onClick={() => toggleEditorsChoice(project.id, project.is_editors_choice)}
                                        className={`p-2 rounded transition-colors ${
                                            project.is_editors_choice 
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                                : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                                        }`}
                                        title="Toggle Editor's Choice"
                                    >
                                        <Award size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Existing hidden content tab */}
            {featuredTab === 'hidden' && (
              <>
            <div className="flex gap-4 p-4 bg-red-900/10 border border-red-500/20 rounded-xl items-end">
<div className="flex-1">
    <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-2">
        Ban by Game ID or Slug
    </label>
    <input 
        value={manualId} 
        onChange={(e) => setManualId(e.target.value)} 
        placeholder="e.g. game-title-abc123 or 123456789" 
        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-red-500 outline-none" 
    />
    <p className="text-xs text-slate-500 mt-1">
        Supports: Supabase slugs (game-title-abc123) or Blogger IDs (123456789)
    </p>
</div>
                <button onClick={manualHide} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase h-9.5">Hide</button>
            </div>
            <div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><EyeOff size={18} /> Hidden Content ({hidden.length})</h3>
                <div className="space-y-2">
                    {hidden.map(h => (
                        <div key={h.game_id} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg">
                            <div>
                                <p className="font-mono text-xs text-white">{h.game_id}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{h.reason}</p>
                            </div>
                            <button onClick={() => unhide(h.game_id)} className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded hover:bg-emerald-500/20 font-bold uppercase flex items-center gap-2"><RefreshCw size={12} /> Restore</button>
                        </div>
                    ))}
                    {hidden.length === 0 && <p className="text-slate-500 text-sm">No content hidden.</p>}
                </div>
            </div>
              </>
              )}
        </div>
    );
}

function SystemManager() {
    const { services, refresh } = useServiceStatus(true);
    const enriched = services.map(s => ({ ...s, ...SERVICES.find(def => def.id === s.serviceId) }));
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Infrastructure Health</h3>
                <button onClick={refresh} className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20">Refresh</button>
            </div>
            <ServiceGrid services={enriched} />
        </div>
    );
}

function BloggerMigration() {
  const [bloggerPosts, setBloggerPosts] = useState([]);
  const [claimedPosts, setClaimedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [groupedByDeveloper, setGroupedByDeveloper] = useState({});

  // Fetch Blogger posts and claimed status
  useEffect(() => {
    fetchBloggerData();
  }, []);

const fetchBloggerData = async () => {
  setLoading(true);
  try {
    // ✅ FIX: Import and use your existing blogger processing
    const { fetchGames } = await import('@/lib/blogger');
    
    // Get properly processed Blogger data
    const bloggerData = await fetchGames();
    
    console.log('📊 Processed Blogger posts:', bloggerData.length);
    console.log('📊 Sample processed post:', bloggerData[0]);
    
    // Fetch claimed posts
    const { data: claimed } = await supabase
      .from('projects')
      .select('original_blogger_id')
      .not('original_blogger_id', 'is', null);
    
    const claimedIds = new Set(claimed?.map(p => p.original_blogger_id) || []);
    const unclaimedPosts = bloggerData.filter(post => !claimedIds.has(post.id));
    
    setBloggerPosts(unclaimedPosts);
    setClaimedPosts(claimedIds);
    
    // Group by developer (now using clean developer names!)
    const grouped = unclaimedPosts.reduce((acc, post) => {
      const dev = post.developer || 'Unknown Developer';
      if (!acc[dev]) acc[dev] = [];
      acc[dev].push(post);
      return acc;
    }, {});
    
    setGroupedByDeveloper(grouped);
    
    console.log('✅ Migration data loaded:', {
      total: bloggerData.length,
      unclaimed: unclaimedPosts.length,
      claimed: claimedIds.size,
      developers: Object.keys(grouped).length
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch Blogger data:', error);
    
    // Set empty arrays on error
    setBloggerPosts([]);
    setGroupedByDeveloper({});
    
    // Show user-friendly error
    alert(`Failed to load Blogger posts: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, developer_name')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,developer_name.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('User search error:', error);
    }
  };

  // Handle user search input
  useEffect(() => {
    const timer = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Assign posts to user
  const assignPosts = async (userId, username) => {
    if (selectedPosts.size === 0) return;
    
    setAssigning(true);
    try {
      const postsToAssign = Array.from(selectedPosts);

      const { data: { session } } = await supabase.auth.getSession();
      
        const response = await fetch('/api/admin/assign-blogger-posts', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}` // ✅ This line
        },
        body: JSON.stringify({
            blogger_post_ids: postsToAssign,
            target_user_id: userId,
            target_username: username
        })
        });
      
      if (!response.ok) throw new Error('Assignment failed');
      
      const result = await response.json();
      
      // Refresh data
      await fetchBloggerData();
      setSelectedPosts(new Set());
      setShowUserSearch(false);
      setSearchQuery('');
      
      alert(`✅ Successfully assigned ${result.assigned_count} posts to ${username}`);
      
    } catch (error) {
      console.error('Assignment error:', error);
      alert('❌ Assignment failed: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

// Toggle post selection
const togglePostSelection = (postId) => {
  // ✅ FIX: Handle invalid post IDs
  if (!postId) {
    console.warn('Cannot select post with invalid ID');
    return;
  }
  
  const newSelection = new Set(selectedPosts);
  if (newSelection.has(postId)) {
    newSelection.delete(postId);
  } else {
    newSelection.add(postId);
  }
  setSelectedPosts(newSelection);
};
  // Select all posts by developer
  const selectAllByDeveloper = (developer) => {
    const devPosts = groupedByDeveloper[developer] || [];
    const newSelection = new Set(selectedPosts);
    devPosts.forEach(post => newSelection.add(post.id));
    setSelectedPosts(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-red-500" size={48} />
        <span className="ml-4 text-white">Loading Blogger posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus size={20} className="text-red-500" />
            Blogger Migration
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {bloggerPosts.length} unclaimed posts • {selectedPosts.size} selected
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => fetchBloggerData()}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          
          {selectedPosts.size > 0 && (
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold"
            >
              Assign {selectedPosts.size} Posts
            </button>
          )}
        </div>
      </div>

{/* Developer Groups */}
<div className="space-y-4">
  {Object.entries(groupedByDeveloper).map(([developer, posts], devIndex) => (
    <div key={`dev-${devIndex}-${developer}`} className="bg-black/20 border border-white/5 rounded-xl p-4">
      {/* Developer Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-white">{developer}</h4>
          <p className="text-slate-400 text-sm">{posts.length} posts</p>
        </div>
        
        <button
          onClick={() => selectAllByDeveloper(developer)}
          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm font-bold"
        >
          Select All {posts.length}
        </button>
      </div>
      
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, postIndex) => (
          <PostCard
            key={`post-${devIndex}-${postIndex}-${post.id || post.title || postIndex}`}
            post={post}
            selected={selectedPosts.has(post.id)}
            onToggle={() => togglePostSelection(post.id)}
          />
        ))}
      </div>
    </div>
  ))}
</div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearchModal
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onAssign={assignPosts}
          onClose={() => setShowUserSearch(false)}
          assigning={assigning}
          selectedCount={selectedPosts.size}
        />
      )}
    </div>
  );
}

// Post Card Component
function PostCard({ post, selected, onToggle }) {
  // ✅ FIX: Ensure we have a valid post object
  if (!post || typeof post !== 'object') {
    return null;
  }

  const postId = post.id || post.title || 'unknown';
  const postTitle = post.title || 'Untitled';
  const postType = post.type || 'Game';
  
  return (
    <div 
      className={`relative bg-slate-800/50 border rounded-lg p-3 cursor-pointer transition-all hover:bg-slate-700/50 ${
        selected ? 'border-red-500 bg-red-500/10' : 'border-white/10'
      }`}
      onClick={onToggle}
    >
      {/* Selection Indicator */}
      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'bg-red-500 border-red-500' : 'border-white/30'
      }`}>
        {selected && <CheckCircle size={12} className="text-white" />}
      </div>
      
      {/* Cover Image */}
      {post.image && (
        <img 
          src={post.image} 
          alt={postTitle}
          className="w-full h-24 object-cover rounded mb-2"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      
      {/* Content */}
      <div>
        <h5 className="font-bold text-white text-sm mb-1 line-clamp-2">{postTitle}</h5>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              postType === 'App' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {postType}
            </span>
            {post.version && (
              <span className="text-xs text-slate-400">v{post.version}</span>
            )}
          </div>
          
          {post.buildPlatform && (
            <p className="text-xs text-slate-500">{post.buildPlatform}</p>
          )}
          
          <p className="text-xs text-slate-400 line-clamp-2">{post.description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
}

// User Search Modal Component
function UserSearchModal({ searchQuery, setSearchQuery, searchResults, onAssign, onClose, assigning, selectedCount }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            Assign {selectedCount} Posts
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>
        
        {/* Search Input */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by username..."
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-white/10 focus:border-red-500 outline-none"
            autoFocus
          />
        </div>
        
        {/* Search Results */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {searchResults.map(user => (
            <button
              key={user.id}
              onClick={() => onAssign(user.id, user.username)}
              disabled={assigning}
              className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{user.username}</p>
                  {user.developer_name && (
                    <p className="text-slate-400 text-xs">{user.developer_name}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
          
          {searchQuery && searchResults.length === 0 && (
            <p className="text-slate-500 text-center py-4">No users found</p>
          )}
        </div>
        
        {assigning && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-red-500" size={20} />
            <span className="ml-2 text-white">Assigning posts...</span>
          </div>
        )}
      </div>
    </div>
  );
}