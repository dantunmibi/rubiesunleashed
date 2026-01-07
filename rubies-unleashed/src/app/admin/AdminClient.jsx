"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import {
  Loader2, ShieldAlert, Users, Flag, CheckCircle, XCircle, EyeOff, Trash2, Plus, RefreshCw, Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import NotFound from "@/app/not-found"; 
import ServiceGrid from "@/components/status/ServiceGrid";
import { useServiceStatus } from "@/hooks/useServiceStatus";
import { SERVICES } from "@/lib/status/services";

export default function AdminClient() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    if (isAdmin) document.title = "Admin Console | Rubies Unleashed";
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  if (!user || !isAdmin) return <NotFound />;

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
            <TabButton active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={Activity} label="System" />
        </div>

        {/* Content (Conditional Rendering for Performance) */}
        <div className="bg-[#161b2c] border border-white/5 rounded-2xl p-6 min-h-[500px]">
            {activeTab === 'reports' && <ReportManager />}
            {activeTab === 'users' && <UserManager />}
            {activeTab === 'content' && <ContentManager />}
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

  const fetchReports = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setReports(data || []);
    } catch (error) {
        console.error("Reports Error:", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchHiddenStatus = async () => {
      const { data } = await supabase.from('hidden_content').select('game_id');
      setHiddenIds(new Set(data?.map(h => h.game_id) || []));
  };

  useEffect(() => { fetchReports(); fetchHiddenStatus(); }, []);

  const updateStatus = async (id, status) => {
    try {
        const { error } = await supabase.from("reports").update({ status }).eq("id", id);
        if (error) throw error;
        fetchReports(); 
    } catch (error) {
        alert("Update failed: " + error.message);
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
            <a href={`/view/${r.game_id}`} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 mt-2 block font-mono underline">
                View Content ({r.game_id})
            </a>
          </div>
          <div className="flex gap-2 items-center">
            <button 
                onClick={() => toggleBan(r.game_id)} 
                className={`p-2 rounded hover:opacity-80 transition-colors ${hiddenIds.has(r.game_id) ? "bg-emerald-900/20 text-emerald-500" : "bg-red-900/20 text-red-500"}`}
                title={hiddenIds.has(r.game_id) ? "Unban" : "Ban Content"}
            >
                {hiddenIds.has(r.game_id) ? <RefreshCw size={18} /> : <EyeOff size={18} />}
            </button>
            <button onClick={() => updateStatus(r.id, "resolved")} className="p-2 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20" title="Resolve"><CheckCircle size={18} /></button>
            <button onClick={() => updateStatus(r.id, "ignored")} className="p-2 bg-slate-500/10 text-slate-500 rounded hover:bg-slate-500/20" title="Ignore"><XCircle size={18} /></button>
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
    if (!confirm("Promote this user to Architect?")) return;
    try {
        const { error } = await supabase.from("profiles").update({ role: "architect", archetype: "architect" }).eq("id", id);
        if (error) throw error;
        fetchUsers(search);
    } catch (error) {
        alert("Promotion failed: " + error.message);
    }
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
            {u.role === "user" && (
              <button onClick={() => promoteUser(u.id)} className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded hover:bg-emerald-500/20 transition-colors font-bold uppercase">Promote</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentManager() {
    const [hidden, setHidden] = useState([]);
    const [manualId, setManualId] = useState("");
    const [loading, setLoading] = useState(false);

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

    useEffect(() => { fetchHidden(); }, []);

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
        if (!manualId) return;
        try {
            const { error } = await supabase.from('hidden_content').insert({ game_id: manualId, reason: 'Manual Admin Action' });
            if (error) throw error;
            setManualId("");
            fetchHidden();
        } catch (error) {
            alert("Hide failed: " + error.message);
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10 text-red-500" />;

    return (
        <div className="space-y-8">
            <div className="flex gap-4 p-4 bg-red-900/10 border border-red-500/20 rounded-xl items-end">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-2">Ban Game ID</label>
                    <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="e.g. 123456789" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-red-500 outline-none" />
                </div>
                <button onClick={manualHide} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase h-[38px]">Hide</button>
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