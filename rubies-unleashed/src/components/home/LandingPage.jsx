"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import FeatureTriangles from "@/components/ui/FeatureTriangles";
import AboutSection from "@/components/ui/AboutSection";
import GameVault from "@/components/ui/GameVault";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";

export default function LandingPage({ games, authLoading = false }) {
  return (
    <div className="min-h-screen bg-background text-slate-200 overflow-x-hidden relative font-sans selection:bg-ruby/30 selection:text-white">
      
      {/* ✅ NEW: Subtle auth loading indicator */}
      {authLoading && (
        <div className="fixed top-24 right-6 z-50 px-4 py-2 bg-surface/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right fade-in duration-500">
          <div className="w-1.5 h-1.5 rounded-full bg-ruby animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Checking session...</span>
        </div>
      )}
      
      <BackgroundEffects />
      <Navbar />
      <Hero />
      <FeatureTriangles />
      <AboutSection />
      <GameVault />
      <Footer />
    </div>
  );
}