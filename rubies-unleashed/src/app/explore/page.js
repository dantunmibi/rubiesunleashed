"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import ExploreContent from "@/components/explore/ExploreContent";

export default function ExplorePage() {
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
        <ExploreContent />
      </Suspense>
      <Footer />
    </div>
  );
}