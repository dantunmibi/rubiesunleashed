'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SessionErrorOverlay({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        
        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
          Session Expired
        </h3>
        
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          Your authentication token has expired. Please refresh to reconnect securely.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={18} /> Refresh Page
          </button>
          
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 rounded-xl transition-colors"
          >
            Sign Out & Login Again
          </button>
        </div>
      </div>
    </div>
  );
}