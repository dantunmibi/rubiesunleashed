'use client';

import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SessionErrorOverlay({ show, onClose }) {
  if (!show) return null;

  const handleSignOut = async () => {
      // 1. Force Redirect immediately if it hangs more than 1s
      const timer = setTimeout(() => {
          window.location.href = '/login';
      }, 1000);

      try {
          // 2. Try Standard SignOut
          await supabase.auth.signOut();
      } catch (err) {
          console.warn("Signout error:", err);
      } finally {
          // 3. Cleanup & Redirect
          clearTimeout(timer);
          // Clear local storage just in case Supabase client didn't
          if (typeof window !== 'undefined') {
              window.localStorage.removeItem('sb-api-auth-token'); // Adjust key if needed, or clear all
          }
          window.location.href = '/login';
      }
  };
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />

        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        
        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
          Session Expired
        </h3>
        
        <p className="text-slate-400 mb-8 text-sm leading-relaxed px-4">
          Your security connection has timed out.
          <br/>Please refresh or re-authenticate to continue.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <RefreshCw size={18} /> Refresh Page
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase text-xs tracking-wider py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Sign Out & Login
          </button>
        </div>
      </div>
    </div>
  );
}