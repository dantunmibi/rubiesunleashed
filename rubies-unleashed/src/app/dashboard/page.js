"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import { Loader2, LayoutDashboard, Upload, BarChart3, Settings } from "lucide-react";


export default function DashboardPage() {
  const { user, isArchitect, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (!isArchitect) router.push('/');
    }
  }, [user, isArchitect, loading, router]);

  if (loading || !isArchitect) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  // ✅ FORCE EMERALD THEME LOCALLY
  // We override the CSS variable for this page subtree
  const dashboardStyle = {
    '--user-accent': 'var(--color-architect)',
    '--user-accent-glow': 'var(--color-architect-glow)',
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-emerald-500/30" style={dashboardStyle}>
      <Navbar />
      
      <main className="pt-32 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <LayoutDashboard size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">The Forge</h1>
              <p className="text-slate-400">Creator Command Center</p>
           </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Card 1: Upload */}
           <button className="group p-8 rounded-2xl bg-[#161b2c] border border-white/5 hover:border-emerald-500/50 transition-all text-left hover:-translate-y-1 shadow-lg hover:shadow-emerald-900/20">
              <Upload size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Deploy Project</h3>
              <p className="text-slate-400 text-sm">Upload new binaries or update existing manifests.</p>
           </button>

           {/* Card 2: Analytics */}
           <button className="group p-8 rounded-2xl bg-[#161b2c] border border-white/5 hover:border-emerald-500/50 transition-all text-left hover:-translate-y-1 shadow-lg hover:shadow-emerald-900/20">
              <BarChart3 size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Analytics</h3>
              <p className="text-slate-400 text-sm">Monitor traffic, downloads, and engagement metrics.</p>
           </button>

           {/* Card 3: Settings */}
           <button className="group p-8 rounded-2xl bg-[#161b2c] border border-white/5 hover:border-emerald-500/50 transition-all text-left hover:-translate-y-1 shadow-lg hover:shadow-emerald-900/20">
              <Settings size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Configuration</h3>
              <p className="text-slate-400 text-sm">Manage API keys and developer profile settings.</p>
           </button>

        </div>

      </main>
    </div>
  );
}