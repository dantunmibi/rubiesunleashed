'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function SessionErrorOverlay({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#161b2c] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">

        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <AlertTriangle size={32} className="text-slate-400" />
        </div>

        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
          Connection Interrupted
        </h3>

        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          The network is unresponsive. Check your connection and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw size={18} /> Retry Connection
        </button>

      </div>
    </div>
  );
}