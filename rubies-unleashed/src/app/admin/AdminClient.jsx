"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import {
  Loader2, ShieldAlert, Users, Flag, CheckCircle, XCircle, EyeOff, Trash2, Plus, RefreshCw, Activity,
  Star, Award, Sparkles, Search, Filter, AlertTriangle, MessageSquare, Clock, TrendingUp, Shield, Package, Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import NotFound from "@/app/not-found"; 
import ServiceGrid from "@/components/status/ServiceGrid";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { SERVICES } from "@/lib/status/services";
import AdminCommentModal from '@/components/admin/AdminCommentModal';


export default function AdminClient() {
  const { user, isAdmin, loading, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

  // ✅ NEW: Shared moderation modal state
  const [moderationModal, setModerationModal] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [moderating, setModerating] = useState(false);
  const [commentModal, setCommentModal] = useState(null);

  // ✅ NEW: Shared moderation handler
  const handleModerate = async (actionType) => {
    if (!moderationModal || !moderationReason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    setModerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          project_id: moderationModal.game_id,
          action_type: actionType,
          reason: moderationReason
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Moderation failed');
      }

      alert(`✅ Project ${actionType}d successfully`);
      setModerationModal(null);
      setModerationReason('');
      
      // Refresh the current tab
      window.location.reload(); // Simple way to refresh all data
      
    } catch (error) {
      console.error('Moderation error:', error);
      alert(`❌ Moderation failed: ${error.message}`);
    } finally {
      setModerating(false);
    }
  };

  useEffect(() => {
    if (isAdmin) document.title = "Admin Console | Rubies Unleashed";
  }, [isAdmin]);

  if (!initialized || loading) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
            <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      );
  }

  if (!user || !isAdmin) {
      return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-red-500/30">
      <Navbar />

      <main className="pt-32 px-6 max-w-350 mx-auto pb-20">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-linear-to-br from-red-500/20 to-purple-500/20 rounded-2xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <ShieldAlert size={32} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tight bg-linear-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                  Admin Console
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-1">Platform Oversight & Moderation Dashboard</p>
              </div>
            </div>
          </div>
          
          <QuickStats />
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 border-b border-white/5">
            <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")} icon={Flag} label="Reports" count={0} />
            <TabButton active={activeTab === "moderation"} onClick={() => setActiveTab("moderation")} icon={MessageSquare} label="Moderation Log" />
            <TabButton active={activeTab === "projects"} onClick={() => setActiveTab("projects")} icon={Package} label="Recent Projects" />
            <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={Users} label="Users" />
            <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={EyeOff} label="Content" />
            <TabButton active={activeTab === "migration"} onClick={() => setActiveTab("migration")} icon={Plus} label="Migration" />
            <TabButton active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={Activity} label="System" />
        </div>

        {/* Content Container */}
        <div className="bg-[#161b2c]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 min-h-125 shadow-2xl">
            {activeTab === 'reports' && (
              <ReportManager 
                moderationModal={moderationModal}
                setModerationModal={setModerationModal}
                moderationReason={moderationReason}
                setModerationReason={setModerationReason}
                moderating={moderating}
                handleModerate={handleModerate}
              />
            )}
            {activeTab === 'projects' && <RecentProjectsTab setCommentModal={setCommentModal} />}
            {activeTab === 'moderation' && (
              <ModerationLog 
                moderationModal={moderationModal}
                setModerationModal={setModerationModal}
                moderationReason={moderationReason}
                setModerationReason={setModerationReason}
              />
            )}
            {activeTab === 'users' && <UserManager />}
            {activeTab === 'content' && <ContentManager />}
            {activeTab === 'migration' && <BloggerMigration />}
            {activeTab === 'system' && <SystemManager />}
        </div>

        {/* ✅ NEW: Shared Moderation Modal */}
        {moderationModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                  <ShieldAlert size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Moderation Action</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {moderationModal.project_title || 'Unknown Project'}
                  </p>
                </div>
              </div>

              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Reason for this action (will be shown to developer)..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-red-500 outline-none min-h-32 mb-6 resize-none"
                autoFocus
              />

              <div className="space-y-3">
                <button
                  onClick={() => handleModerate('hide')}
                  disabled={moderating || !moderationReason.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {moderating ? <Loader2 className="animate-spin" size={16} /> : <EyeOff size={16} />}
                  Hide from Feed
                </button>

                <button
                  onClick={() => handleModerate('restore')}
                  disabled={moderating || !moderationReason.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {moderating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Restore Project
                </button>

                <button
                  onClick={() => handleModerate('ban')}
                  disabled={moderating || !moderationReason.trim()}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {moderating ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                  Ban Project
                </button>

                <button
                  onClick={() => { 
                    setModerationModal(null); 
                    setModerationReason(''); 
                  }}
                  disabled={moderating}
                  className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 px-4 py-3 rounded-xl font-bold uppercase text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Comment Modal */}
        {commentModal && (
          <AdminCommentModal
            project={commentModal}
            onClose={() => setCommentModal(null)}
            onSuccess={() => {
              setCommentModal(null);
              // Optionally refresh tab data
            }}
          />
        )}
      </main>
    </div>
  );
}

// Quick Stats Component
function QuickStats() {
  const [stats, setStats] = useState({ reports: 0, banned: 0, users: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [reportsRes, bannedRes, usersRes] = await Promise.all([
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'banned'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        reports: reportsRes.count || 0,
        banned: bannedRes.count || 0,
        users: usersRes.count || 0
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="flex gap-4">
      <StatBadge label="Active Reports" value={stats.reports} color="red" />
      <StatBadge label="Banned Projects" value={stats.banned} color="amber" />
      <StatBadge label="Total Users" value={stats.users} color="blue" />
    </div>
  );
}

function StatBadge({ label, value, color }) {
  const colors = {
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <div className={`px-4 py-2 rounded-xl border ${colors[color]} backdrop-blur-sm`}>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-6 py-3.5 font-bold text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
        active 
          ? "bg-red-500/10 text-white border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
      }`}
    >
      <Icon size={16} /> 
      {label}
      {count !== undefined && count > 0 && (
        <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-5 text-center">
          {count}
        </span>
      )}
    </button>
  );
}

// NEW: Moderation Log Component
function ModerationLog({ moderationModal, setModerationModal, moderationReason, setModerationReason }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchActions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/moderate', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (res.ok) {
        const { actions: data } = await res.json();
        setActions(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch moderation log:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewRequests = actions.filter(a => a.action_type === 'review_request');
const otherActions = actions.filter(a => a.action_type !== 'review_request');

  useEffect(() => { fetchActions(); }, []);

const filteredActions = filter === 'all' 
  ? otherActions  // ✅ CHANGED: Use otherActions instead of actions
  : otherActions.filter(a => a.action_type === filter); // ✅ CHANGED

  const actionColors = {
    hide: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    delete: 'bg-red-500/10 text-red-400 border-red-500/20',
    ban: 'bg-red-500/10 text-red-400 border-red-500/20',
    restore: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    unban: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-10 text-red-500" size={32} />;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-red-500" />
          Moderation History ({filteredActions.length})
        </h3>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-red-500 outline-none"
        >
          <option value="all">All Actions</option>
          <option value="hide">Hide</option>
          <option value="ban">Ban</option>
          <option value="delete">Delete</option>
          <option value="restore">Restore</option>
          <option value="unban">Unban</option>
        </select>
            {/* ✅ NEW: Clear All Button */}
<button
  onClick={async () => {
    if (!confirm('⚠️ Clear ALL moderation history? This cannot be undone!')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/admin/moderate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ clearAll: true })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Clear failed');
      }

      setActions([]);
      alert('✅ Moderation history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert(`❌ ${error.message}`);
    }
  }}
      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 text-xs font-bold uppercase flex items-center gap-2"
    >
      <Trash2 size={14} />
      Clear All
    </button>
      </div>

      {/* Review Requests Section */}
      {reviewRequests.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <h4 className="font-bold text-amber-400 mb-4 flex items-center gap-2">
            <Shield size={18} />
            Pending Review Requests ({reviewRequests.length})
          </h4>
          
          <div className="space-y-3">
            {reviewRequests.map((request) => (
              <div key={request.id} className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white mb-1">{request.project_title}</h5>
                  <p className="text-xs text-slate-400">
                    Requested by {request.developer_username} • {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const projectId = request.project_id || request.metadata?.original_hide_action_id;
                      if (projectId) {
                        setModerationModal({ 
                          game_id: projectId,
                          project_title: request.project_title 
                        });
                        setModerationReason('Review request approved');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-xs font-bold uppercase"
                  >
                    Approve & Restore
                  </button>
                  
<button
  onClick={async () => {
    if (!confirm('Delete this review request?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/admin/moderate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ actionId: request.id })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Delete failed');
      }

      setActions(prev => prev.filter(action => action.id !== request.id));
      alert('✅ Review request deleted');
    } catch (error) {
      console.error('Failed to delete request:', error);
      alert(`❌ ${error.message}`);
    }
  }}
  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs font-bold uppercase"
>
  Deny & Delete
</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No moderation actions recorded.</p>
        ) : (
          filteredActions.map((action) => (
            <div key={action.id} className="bg-black/20 border border-white/5 rounded-xl p-6 hover:bg-black/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase ${actionColors[action.action_type]}`}>
                      {action.action_type}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(action.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-white mb-1">{action.project_title}</h4>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span>Developer: <span className="text-slate-300 font-mono">{action.developer_username}</span></span>
                    <span>•</span>
                    <span>Admin: <span className="text-red-400 font-mono">{action.admin_username}</span></span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Reason</p>
                    <p className="text-sm text-white">{action.reason}</p>
                  </div>
                </div>
                
  <div className="flex gap-2">
    {!action.acknowledged && (
      <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
        <p className="text-amber-400 text-xs font-bold uppercase">Unread</p>
      </div>
    )}
    
    {/* ✅ NEW: Delete individual action */}
<button
  onClick={async () => {
    if (!confirm('Delete this moderation record?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/admin/moderate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ actionId: action.id })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Delete failed');
      }

      setActions(prev => prev.filter(a => a.id !== action.id));
      console.log('✅ Record deleted permanently');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`❌ ${error.message}`);
    }
  }}
      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/20"
      title="Delete Record"
    >
      <Trash2 size={14} />
    </button>
  </div>
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Enhanced Report Manager with Moderation Actions
function ReportManager({ 
  moderationModal, 
  setModerationModal, 
  moderationReason, 
  setModerationReason,
  moderating,
  handleModerate 
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(new Map());

  const fetchReports = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setReports(data || []);
        
        // Fetch project details for all reports
        await fetchProjectDetails(data || []);
    } catch (error) {
        console.error("Reports Error:", error);
    } finally {
        setLoading(false);
    }
  };

const fetchProjectDetails = async (reports) => {
  const detailsMap = new Map();
  
  // Separate UUIDs from Blogger IDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const supabaseIds = [];
  const bloggerIds = [];
  
  reports.forEach(r => {
    if (uuidRegex.test(r.game_id)) {
      supabaseIds.push(r.game_id);
    } else {
      bloggerIds.push(r.game_id);
    }
  });
  
  // ✅ Fetch Supabase project details
  if (supabaseIds.length > 0) {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, slug, title, developer')
        .in('id', supabaseIds);
      
      projects?.forEach(p => {
        detailsMap.set(p.id, {
          title: p.title,
          developer: p.developer,
          slug: p.slug,
          viewUrl: `/view/${p.slug}`,
          source: 'Supabase'
        });
      });
    } catch (error) {
      console.error('Failed to fetch Supabase projects:', error);
    }
  }
  
  // ✅ Fetch Blogger post details using processed data
  if (bloggerIds.length > 0) {
    try {
      const { getUnifiedFeed } = await import('@/lib/game-service-client');
      const allGames = await getUnifiedFeed({ limit: 500, includeHidden: true }); // ✅ Admin mode
      
      // Filter to only Blogger games
      const bloggerGames = allGames.filter(game => game.source !== 'supabase');
      
      bloggerGames.forEach(game => {
        if (bloggerIds.includes(game.id)) {
          detailsMap.set(game.id, {
            title: game.title,
            developer: game.developer,
            slug: game.slug, // ✅ Already in slug-id format!
            viewUrl: `/view/${game.slug}`,
            source: 'Blogger'
          });
        }
      });
    } catch (error) {
      console.error('Failed to fetch Blogger games:', error);
    }
  }
  
  setProjectDetails(detailsMap);
};

  useEffect(() => { fetchReports(); }, []);

  // ✅ MOVED: Define getProjectInfo BEFORE it's used in JSX
  const getProjectInfo = (gameId) => {
    if (projectDetails.has(gameId)) {
      return projectDetails.get(gameId);
    }
    
    // Fallback if not found
    return {
      title: 'Unknown Project',
      developer: 'Unknown Developer',
      slug: gameId,
      viewUrl: `/view/${gameId}`,
      source: 'Unknown'
    };
  };

  const updateStatus = async (id, status) => {
    try {
        const { error } = await supabase
          .from("reports")
          .update({ status })
          .eq("id", id);
        
        if (error) throw error;
        fetchReports(); 
    } catch (error) {
        alert("Update failed: " + error.message);
    }
  };

  const deleteReport = async (id) => {
    if (!confirm('Delete this report permanently?')) return;
    
    try {
        const { error } = await supabase
          .from("reports")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
        alert("Delete failed: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-3 text-slate-400">Loading reports...</span>
      </div>
    );
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-10">
        <Flag size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-500 text-lg font-bold">No active reports</p>
        <p className="text-slate-600 text-sm mt-2">Community reports will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reports.map((r) => {
          const projectInfo = getProjectInfo(r.game_id); // ✅ Now defined
          
          return (
            <div key={r.id} className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Report Details */}
                <div className="flex-1 space-y-4">
                  {/* Status Badge & Date */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      r.status === "resolved" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                        : r.status === "ignored"
                        ? "bg-slate-500/20 text-slate-400 border border-slate-500/20"
                        : "bg-red-500/20 text-red-400 border border-red-500/20"
                    }`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(r.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
{/* Project Info */}
<div className="bg-white/5 border border-white/5 rounded-xl p-4">
  <div className="flex items-start justify-between gap-3 mb-3">
    <div className="flex-1">
      <h4 className="font-bold text-white text-lg mb-1">{projectInfo.title}</h4>
      <p className="text-sm text-slate-400">by {projectInfo.developer}</p>
    </div>
    <span className={`px-2 py-1 rounded text-xs font-bold ${
      projectInfo.source === 'Supabase' 
        ? 'bg-emerald-500/20 text-emerald-400' 
        : 'bg-blue-500/20 text-blue-400'
    }`}>
      {projectInfo.source}
    </span>
  </div>
  
  {/* ✅ FIXED: Use slug, not name */}
  <a 
    href={projectInfo.viewUrl} 
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-blue-400 hover:text-blue-300 font-mono underline inline-flex items-center gap-1"
  >
    View Project
    <span className="text-slate-600">({projectInfo.slug})</span>
  </a>
</div>
                  
                  {/* Report Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <h5 className="font-bold text-white text-sm uppercase tracking-wider">
                        {r.issue_type}
                      </h5>
                    </div>
                    
                    {r.description && (
                      <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                        <p className="text-sm text-slate-300">{r.description}</p>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    {r.metadata && Object.keys(r.metadata).length > 0 && (
                      <details className="bg-white/5 rounded-lg">
                        <summary className="px-3 py-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                          Technical Details
                        </summary>
                        <div className="px-3 pb-3 space-y-1">
                          {r.metadata.browser && (
                            <p className="text-xs text-slate-500">
                              <strong>Browser:</strong> {r.metadata.browser}
                            </p>
                          )}
                          {r.metadata.user_agent && (
                            <p className="text-xs text-slate-500 font-mono truncate">
                              <strong>User Agent:</strong> {r.metadata.user_agent}
                            </p>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
                
                {/* Right: Action Buttons */}
                <div className="flex lg:flex-col gap-2 items-start">
                  <button 
                    onClick={() => setModerationModal(r)}
                    className="p-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-2 whitespace-nowrap"
                    title="Take Moderation Action"
                  >
                    <ShieldAlert size={18} />
                    <span className="hidden lg:inline text-xs font-bold uppercase">Moderate</span>
                  </button>
                  
                  <button 
                    onClick={() => updateStatus(r.id, "resolved")} 
                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-2 whitespace-nowrap" 
                    title="Mark as Resolved"
                  >
                    <CheckCircle size={18} />
                    <span className="hidden lg:inline text-xs font-bold uppercase">Resolve</span>
                  </button>
                  
                  <button 
                    onClick={() => updateStatus(r.id, "ignored")} 
                    className="p-3 bg-slate-500/10 text-slate-500 rounded-lg hover:bg-slate-500/20 border border-slate-500/20 transition-colors flex items-center gap-2 whitespace-nowrap" 
                    title="Mark as Ignored"
                  >
                    <XCircle size={18} />
                    <span className="hidden lg:inline text-xs font-bold uppercase">Ignore</span>
                  </button>
                  
                  <button 
                    onClick={() => deleteReport(r.id)} 
                    className="p-3 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20 border border-slate-500/20 transition-colors flex items-center gap-2 whitespace-nowrap" 
                    title="Delete Report"
                  >
                    <Trash2 size={18} />
                    <span className="hidden lg:inline text-xs font-bold uppercase">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Rest of the components remain the same as your original file
// (UserManager, ContentManager, SystemManager, BloggerMigration)
// I'll include them for completeness but they're unchanged

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
    else fetchUsers(search);
  };

  const demoteUser = async (id) => {
    if (!confirm("Demote to User?")) return;
    const { error } = await supabase.from("profiles").update({ role: "user", archetype: "hunter" }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchUsers(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search username..." 
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-red-500 outline-none"
          />
        </div>
        <button 
          onClick={() => fetchUsers(search)} 
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-6 py-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
          Search
        </button>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-black/20 hover:bg-black/30 transition-colors">
            <div className="flex items-center gap-3">
                <a href={`/${u.username}`} target="_blank"><div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white">
                    {u.avatar_url && u.avatar_url.startsWith('http') ? 
                      <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : 
                      <span className="text-sm font-bold">{u.username ? u.username[0].toUpperCase() : "?"}</span>
                    }
                </div>
                </a>
                <div>
                    <p className="font-bold text-white">{u.username}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{u.role} • {u.archetype}</p>
                </div>
            </div>

            {u.role === "user" && (
              <button 
                onClick={() => promoteUser(u.id)} 
                className="text-xs bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-500/20 font-bold uppercase border border-emerald-500/20"
              >
                Promote
              </button>
            )}
            
            {u.role === "architect" && (
              <button 
                onClick={() => demoteUser(u.id)} 
                className="text-xs bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 font-bold uppercase border border-red-500/20"
              >
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
    const [bannedProjects, setBannedProjects] = useState([]);
    const [flaggedProjects, setFlaggedProjects] = useState([]);
    const [manualId, setManualId] = useState("");
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [contentTab, setContentTab] = useState('hidden');

    const fetchHidden = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('hidden_content')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setHidden(data || []);
        } catch (error) {
            console.error("Hidden Content Error:", error);
        } finally {
            setLoading(false);
        }
    };

const fetchBannedProjects = async () => {
  setLoading(true);
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'banned')
      .order('updated_at', { ascending: false });
    
    if (projectsError) throw projectsError;

    // ✅ NEW APPROACH: Check moderation_actions to see which were MANUALLY banned
    const { data: moderationActions } = await supabase
      .from('moderation_actions')
      .select('project_id')
      .eq('action_type', 'ban');

    // Projects with moderation_action = manually banned by admin
    const manuallyBannedIds = new Set(moderationActions?.map(a => a.project_id) || []);

    // Filter: Only show projects that HAVE a moderation action
    const manuallyBanned = projects?.filter(p => manuallyBannedIds.has(p.id)) || [];
    
    console.log('✅ Manually banned (has moderation_action):', manuallyBanned);
    setBannedProjects(manuallyBanned);
  } catch (error) {
    console.error("Banned Projects Error:", error);
  } finally {
    setLoading(false);
  }
};

const fetchFlaggedProjects = async () => {
  setLoading(true);
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'banned')
      .order('updated_at', { ascending: false });
    
    if (projectsError) throw projectsError;

    // ✅ NEW APPROACH: Check moderation_actions
    const { data: moderationActions } = await supabase
      .from('moderation_actions')
      .select('project_id')
      .eq('action_type', 'ban');

    const manuallyBannedIds = new Set(moderationActions?.map(a => a.project_id) || []);

    // Filter: Only show projects that DON'T have a moderation action (auto-flagged by trigger)
    const autoFlagged = projects?.filter(p => !manuallyBannedIds.has(p.id)) || [];
    
    console.log('✅ Auto-flagged (no moderation_action):', autoFlagged);
    setFlaggedProjects(autoFlagged);
  } catch (error) {
    console.error("Flagged Projects Error:", error);
  } finally {
    setLoading(false);
  }
};

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
        fetchBannedProjects();
        fetchFlaggedProjects();
    }, []);

    const restoreProject = async (projectId) => {
        if (!confirm('Restore this project to published status?')) return;
        
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status: 'published' })
                .eq('id', projectId);
            
            if (error) throw error;
            fetchBannedProjects();
            fetchFlaggedProjects();
            fetchProjects();
        } catch (error) {
            alert("Restore failed: " + error.message);
        }
    };

const permanentlyDelete = async (projectId, projectTitle) => {
  // ✅ Simple confirmation for admins (no title typing)
  if (!confirm(`⚠️ PERMANENTLY DELETE "${projectTitle}"?\n\nThis action cannot be undone!`)) {
    return;
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // ✅ Admin delete - no confirmTitle needed
    const response = await fetch(`/api/projects/delete?id=${projectId}&hard=true`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }
    
    const result = await response.json();
    
    // Update local state
    setBannedProjects(prev => prev.filter(p => p.id !== projectId));
    setFlaggedProjects(prev => prev.filter(p => p.id !== projectId));
    
    alert('✅ ' + result.message);
  } catch (error) {
    console.error('Delete error:', error);
    alert("❌ Delete failed: " + error.message);
  }
};
    const toggleFeatured = async (projectId, currentStatus) => {
        try {
            const nextOrder = !currentStatus ? Math.floor(Date.now() / 1000) : 0;
            
            const { error } = await supabase
                .from('projects')
                .update({ 
                    is_featured: !currentStatus,
                    featured_order: nextOrder
                })
                .eq('id', projectId);
            
            if (error) throw error;
            fetchProjects();
        } catch (error) {
            alert("Feature toggle failed: " + error.message);
        }
    };

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
            const { error } = await supabase
                .from('hidden_content')
                .delete()
                .eq('game_id', id);
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
            
            if (manualId.includes('-') && manualId.length > 10) {
                const { data: project } = await supabase
                    .from('projects')
                    .select('id, title, slug')
                    .eq('slug', manualId)
                    .single();
                
                if (project) gameIdToHide = project.id;
            }
            
            const { error } = await supabase
                .from('hidden_content')
                .insert({ 
                    game_id: gameIdToHide, 
                    reason: `Manual Admin Action (Input: ${manualId})` 
                });
            
            if (error) throw error;
            setManualId("");
            fetchHidden();
        } catch (error) {
            alert("Hide failed: " + error.message);
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10 text-red-500" size={32} />;

    return (
        <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setContentTab('hidden')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${contentTab === 'hidden' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Hidden Content ({hidden.length})
                </button>
                <button
                    onClick={() => setContentTab('banned')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${contentTab === 'banned' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Moderation Bans ({bannedProjects.length})
                </button>
                <button
                    onClick={() => setContentTab('flagged')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${contentTab === 'flagged' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Auto-Flagged ({flaggedProjects.length})
                </button>
                <button
                    onClick={() => setContentTab('featured')}
                    className={`px-4 py-2 font-bold text-sm uppercase ${contentTab === 'featured' ? 'text-white border-b-2 border-red-500' : 'text-slate-500'}`}
                >
                    Featured Content
                </button>
            </div>

            {/* Hidden Content Tab */}
{contentTab === 'hidden' && (
  <>
    <div className="flex gap-4 p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl items-end">
      <div className="flex-1">
        <label className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
          Hide by Game ID or Slug
        </label>
        <input 
          value={manualId} 
          onChange={(e) => setManualId(e.target.value)} 
          placeholder="e.g. game-title-abc123 or 123456789" 
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-500 outline-none" 
        />
      </div>
      <button 
        onClick={manualHide} 
        className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase"
      >
        Hide
      </button>
    </div>
    
    <div>
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <EyeOff size={18} className="text-amber-500" /> Hidden Content ({hidden.length})
      </h3>
      <div className="space-y-3">
        {hidden.map(h => (
          <HiddenContentCard key={h.game_id} hiddenItem={h} onRestore={unhide} />
        ))}
      </div>
    </div>
  </>
)}

            {/* Moderation Bans Tab */}
            {contentTab === 'banned' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-500" /> Moderation Bans ({bannedProjects.length})
                    </h3>
                    <p className="text-slate-400 text-sm">Projects banned by admin action via moderation API.</p>
                    
                    {bannedProjects.length === 0 ? (
                        <p className="text-slate-500 text-sm">No banned projects.</p>
                    ) : (
                        bannedProjects.map(project => (
                            <div key={project.id} className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
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
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <a
                                      href={`/admin/preview/${project.slug}`}
                                      target="_blank"
                                      className="p-2 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/40 border border-slate-600/30"
                                      title="Preview"
                                    >
                                      <EyeOff size={16} />
                                    </a>
                                    
                                    <button
                                        onClick={() => restoreProject(project.id)}
                                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 border border-emerald-500/30"
                                        title="Restore to Published"
                                    >
                                        <RefreshCw size={16} />
                                    </button>

<button
  onClick={() => permanentlyDelete(project.id, project.title)} // ✅ Pass title
  className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 border border-red-500/30"
  title="Permanently Delete"
>
  <Trash2 size={16} />
</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Auto-Flagged Tab */}
            {contentTab === 'flagged' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" /> Auto-Flagged Projects ({flaggedProjects.length})
                    </h3>
                    <p className="text-slate-400 text-sm">Projects automatically flagged by 3+ malware reports.</p>
                    
                    {flaggedProjects.length === 0 ? (
                        <p className="text-slate-500 text-sm">No flagged projects.</p>
                    ) : (
                        flaggedProjects.map(project => (
                            <div key={project.id} className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={project.cover_url || '/placeholder-game.png'} 
                                        className="w-16 h-20 object-cover rounded border border-amber-500/30" 
                                        alt={project.title}
                                    />
                                    <div>
                                        <h4 className="font-bold text-white">{project.title}</h4>
                                        <p className="text-slate-400 text-sm">{project.developer}</p>
                                        <p className="text-amber-400 text-xs mt-1">
                                            Flagged: {new Date(project.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <a
                                      href={`/admin/preview/${project.slug}`}
                                      target="_blank"
                                      className="p-2 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/40 border border-slate-600/30"
                                      title="Preview"
                                    >
                                      <EyeOff size={16} />
                                    </a>
                                    
                                    <button
                                        onClick={() => restoreProject(project.id)}
                                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 border border-emerald-500/30"
                                        title="Mark as Safe"
                                    >
                                        <CheckCircle size={16} />
                                    </button>

<button
  onClick={() => permanentlyDelete(project.id, project.title)} // ✅ Pass title
  className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 border border-red-500/30"
  title="Permanently Delete"
>
  <Trash2 size={16} />
</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Featured Content Tab (unchanged) */}
            {contentTab === 'featured' && (
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
                                    >
                                        <Award size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ✅ FIXED: Use fetchGameById from blogger.js for fully processed data
function HiddenContentCard({ hiddenItem, onRestore }) {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [hiddenItem.game_id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // ✅ Supabase projects (UUID pattern)
      if (uuidRegex.test(hiddenItem.game_id)) {
        const { data: project } = await supabase
          .from('projects')
          .select('id, title, developer, cover_url, slug')
          .eq('id', hiddenItem.game_id)
          .single();
        
        if (project) {
          setProjectData({
            ...project,
            source: 'Supabase'
          });
          setLoading(false);
          return;
        }
      }

      // ✅ Blogger posts - use existing fetchGameById (fully processed)
      const { fetchGameById } = await import('@/lib/blogger');
      const game = await fetchGameById(hiddenItem.game_id);
      
      if (game) {
        setProjectData({
          id: game.id,
          title: game.title,
          developer: game.developer,
          cover_url: game.image,
          slug: game.slug,
          source: 'Blogger'
        });
      } else {
        // Post was deleted from Blogger entirely
        setProjectData({
          id: hiddenItem.game_id,
          title: 'Deleted Post',
          developer: 'No longer available',
          cover_url: null,
          slug: hiddenItem.game_id,
          source: 'Deleted',
          isOrphaned: true
        });
      }
    } catch (error) {
      console.error('Failed to fetch hidden project data:', error);
      setProjectData({
        id: hiddenItem.game_id,
        title: 'Error Loading',
        developer: 'Unable to fetch data',
        cover_url: null,
        slug: hiddenItem.game_id,
        source: 'Error',
        isOrphaned: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-16 h-20 bg-slate-800 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-800 animate-pulse rounded" />
            <div className="h-3 w-24 bg-slate-800 animate-pulse rounded" />
          </div>
        </div>
        <Loader2 className="animate-spin text-slate-600" size={16} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg hover:bg-black/30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Cover Image */}
        <div className="w-16 h-20 bg-slate-900 rounded border border-white/10 overflow-hidden shrink-0">
          {projectData?.cover_url ? (
            <img 
              src={projectData.cover_url} 
              alt={projectData.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700">
              <Package size={24} />
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm mb-1 truncate">
            {projectData?.title || 'Unknown Project'}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {projectData?.developer || 'Unknown Developer'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-mono text-xs text-slate-600 truncate">
              {hiddenItem.game_id}
            </p>
            {projectData?.source && (
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                projectData.source === 'Blogger' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : projectData.source === 'Supabase'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                {projectData.source}
              </span>
            )}
          </div>
          {hiddenItem.reason && (
            <p className="text-xs text-amber-400/70 mt-1 line-clamp-1">
              {hiddenItem.reason}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 shrink-0 ml-4">
        {/* Preview Button */}
        <a 
          href={projectData?.source === 'Blogger' 
            ? `/view/${projectData.slug}` 
            : `/admin/preview/${projectData.slug}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 border border-blue-500/20"
          title="Preview"
        >
          <Eye size={16} />
        </a>
        
        {/* Restore Button */}
        <button 
          onClick={() => onRestore(hiddenItem.game_id)} 
          className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 font-bold uppercase border border-emerald-500/20 text-xs"
        >
          Restore
        </button>
      </div>
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
    const timer = setTimeout(() => searchUsers(searchQuery), 1000);
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

function RecentProjectsTab({ setCommentModal }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moderationModal, setModerationModal] = useState(null); // ✅ ADD
  const [moderationReason, setModerationReason] = useState(''); // ✅ ADD
  const [moderating, setModerating] = useState(false); // ✅ ADD



const [hiddenIds, setHiddenIds] = useState(new Set());

const fetchProjects = async () => {
  setLoading(true);
  try {
    // Fetch projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['published', 'banned', 'flagged'])
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    // Fetch hidden content IDs
    const { data: hiddenContent } = await supabase
      .from('hidden_content')
      .select('game_id');
    
    const hiddenSet = new Set(hiddenContent?.map(h => h.game_id) || []);
    setHiddenIds(hiddenSet);
    
    setProjects(data || []);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ ADD: Shared moderation handler
  const handleModerate = async (actionType) => {
    if (!moderationModal || !moderationReason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    setModerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          project_id: moderationModal.id,
          action_type: actionType,
          reason: moderationReason
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Moderation failed');
      }

      alert(`✅ Project ${actionType}d successfully`);
      setModerationModal(null);
      setModerationReason('');
      fetchProjects(); // Refresh list
      
    } catch (error) {
      console.error('Moderation error:', error);
      alert(`❌ Moderation failed: ${error.message}`);
    } finally {
      setModerating(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(query) || 
             p.developer.toLowerCase().includes(query);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-red-500" size={48} />
        <span className="ml-4 text-white">Loading projects...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-red-500" />
              Recent Published Projects
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {filteredProjects.length} projects
            </p>
          </div>
          
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or developer..."
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-red-500 outline-none"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}

  isHidden={hiddenIds.has(project.id)} // ✅ Pass hidden status
              onComment={() => setCommentModal(project)}
              onModerate={() => setModerationModal(project)} // ✅ PASS HANDLER
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500 text-lg font-bold">No projects found</p>
          </div>
        )}
      </div>

      {/* ✅ ADD: Shared Moderation Modal */}
      {moderationModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <ShieldAlert size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Moderation Action</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {moderationModal.title}
                </p>
              </div>
            </div>

            <textarea
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              placeholder="Reason for this action (will be shown to developer)..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-red-500 outline-none min-h-32 mb-6 resize-none"
              autoFocus
            />

            <div className="space-y-3">
              <button
                onClick={() => handleModerate('hide')}
                disabled={moderating || !moderationReason.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {moderating ? <Loader2 className="animate-spin" size={16} /> : <EyeOff size={16} />}
                Hide from Feed
              </button>

              <button
                onClick={() => handleModerate('restore')}
                disabled={moderating || !moderationReason.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {moderating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                Restore Project
              </button>

              <button
                onClick={() => handleModerate('ban')}
                disabled={moderating || !moderationReason.trim()}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {moderating ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                Ban Project
              </button>

              <button
                onClick={() => { 
                  setModerationModal(null); 
                  setModerationReason(''); 
                }}
                disabled={moderating}
                className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 px-4 py-3 rounded-xl font-bold uppercase text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProjectCard({ project, isHidden, onComment, onModerate }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
      {/* Cover Image */}
      <div className="relative aspect-video bg-slate-900">
        {project.cover_url ? (
          <img 
            src={project.cover_url} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <Package size={48} />
          </div>
        )}
        
        {/* ✅ Status Badge Overlay */}
        {project.status !== 'published' && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
              project.status === 'banned' 
                ? 'bg-red-500/90 text-white' 
                : project.status === 'flagged'
                ? 'bg-amber-500/90 text-white'
                : 'bg-slate-500/90 text-white'
            }`}>
              {project.status}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-white line-clamp-1 flex-1">{project.title}</h4>
            
            {/* ✅ FIXED: Use isHidden prop instead of project.is_hidden */}
            {isHidden && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold uppercase shrink-0">
                Hidden
              </span>
            )}
          </div>
          
          <span className="text-sm text-slate-400">{project.developer}</span>
          <p className="text-xs text-slate-600 mt-1">
            {new Date(project.created_at).toLocaleDateString()}
          </p>
          
          {/* ✅ Show status description */}
          {project.status !== 'published' && (
            <p className="text-xs mt-2 px-2 py-1 rounded bg-black/30 border border-white/5">
              {project.status === 'banned' && (
                <span className="text-red-400">🚫 Banned by moderation</span>
              )}
              {project.status === 'flagged' && (
                <span className="text-amber-400">⚠️ Auto-flagged (3+ reports)</span>
              )}
            </p>
          )}
        </div>

        {/* Actions - rest stays the same */}
        <div className="flex gap-2">
          <button
            onClick={onComment}
            className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 border border-blue-500/30 text-xs font-bold uppercase flex items-center justify-center gap-1"
          >
            <MessageSquare size={14} />
            Comment
          </button>

          <button
            onClick={onModerate}
            className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 text-xs font-bold uppercase flex items-center justify-center gap-1"
          >
            <ShieldAlert size={14} />
            Moderate
          </button>

          <a  
            href={`/view/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-600/20 text-slate-400 rounded-lg hover:bg-slate-600/40 border border-slate-600/30 text-xs font-bold uppercase flex items-center justify-center"
          >
            <Eye size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}