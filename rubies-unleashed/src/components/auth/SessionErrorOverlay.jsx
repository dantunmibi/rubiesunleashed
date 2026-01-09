"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function SessionErrorOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleEvent = () => setShow(true);
    window.addEventListener("sessionExpired", handleEvent);
    return () => window.removeEventListener("sessionExpired", handleEvent);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
                <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Link Severed</h3>
            <p className="text-slate-400 mb-8 text-sm">Your security token has expired. Re-initialization required.</p>
            <button 
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
                <RefreshCw size={18} /> Reconnect
            </button>
        </div>
    </div>
  );
}