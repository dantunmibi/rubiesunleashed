"use client";

/* 
  💎 RUBIES UNLEASHED - Error Boundary (View Route)
  -------------------------------------------------
  - Catches runtime errors in the Game Details page.
  - "System Malfunction" cinematic aesthetic.
  - Provides Recovery Option (Retry) & Safe Exit.
*/

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("🚨 VIEW ROUTE ERROR:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-ruby)_0%,transparent_70%)] opacity-5" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-ruby/10 blur-[100px]" />
      </div>

      <div className="z-10 max-w-md w-full text-center space-y-8">
        {/* Icon & Glitch Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-ruby/20 blur-xl rounded-full animate-pulse" />
            <AlertTriangle
              className="w-20 h-20 text-ruby relative z-10"
              strokeWidth={1.5}
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white animate-glitch">
            System Failure
          </h1>

          <div className="h-px w-24 bg-linear-to-r from-transparent via-ruby to-transparent opacity-50" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <p className="text-ruby font-bold tracking-widest text-xs uppercase">
            Error Code: CRITICAL_DATA_CORRUPTION
          </p>
          <p className="text-slate-400 leading-relaxed border border-white/5 bg-surface/50 p-4 rounded-xl text-sm">
            {error.message ||
              "The neural link to this item was severed unexpectedly."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {/* Retry Button */}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-ruby hover:bg-ruby-dark text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(224,17,95,0.4)] hover:shadow-[0_0_30px_rgba(224,17,95,0.6)] hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} />
            Reboot System
          </button>

          {/* Safe Exit */}
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-surface hover:bg-white/5 border border-white/10 text-slate-300 font-bold uppercase tracking-widest text-xs rounded-xl transition-all hover:border-white/20"
          >
            <Home size={16} />
            Return to Vault
          </Link>
        </div>
      </div>

      {/* Footer ID */}
      <div className="absolute bottom-8 text-white/10 text-[10px] uppercase tracking-[0.2em] font-mono">
        ID: ERR_BOUNDARY_V21
      </div>
    </div>
  );
}
