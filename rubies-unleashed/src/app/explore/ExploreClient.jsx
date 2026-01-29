"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import ExploreContent from "@/components/explore/ExploreContent";

export default function ExploreClient() {
  const { showSessionError, triggerError } = useSessionGuard();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center text-ruby">
            <Loader2 className="animate-spin" size={48} />
          </div>
        }
      >
        <ExploreContent triggerError={triggerError} />
      </Suspense>
      <Footer />
      <SessionErrorOverlay show={showSessionError} />
    </div>
  );
}