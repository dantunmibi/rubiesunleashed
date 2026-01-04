/**
 * ================================================================
 * ABOUT PAGE - The Manifesto (Refined & Corrected)
 * ================================================================
 * 
 * Purpose:
 * - Tells the story of RubyApks -> Rubies Unleashed
 * - Explains the mission, values, and the "Rubies Economy" (Gamified)
 * - Cinematic, digestible layout
 * - STRICT Tailwind v4 Canonical Classes (No arbitrary values)
 * ================================================================
 */

"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { Gem, Target, Users, Zap, Shield, ArrowRight, History, Heart, Trophy, Crown } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-ruby/30 selection:text-white overflow-x-hidden">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10">
        
        {/* 1. HERO - THE VISION */}
        <section className="relative pt-40 pb-20 px-6 lg:px-8 text-center overflow-hidden">
          {/* ✅ FIXED: Use canonical h-200 w-200 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-ruby/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ruby/10 border border-ruby/30 rounded-full mb-8 font-bold text-sm text-ruby uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Gem size={14} />
              <span>Our Purpose</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight text-white leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              CREATIVITY <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-ruby to-rose-500">UNLEASHED</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              We believe independent creators are the source of the most original ideas in technology. Too often, they are buried by algorithms. <br/><span className="text-white font-bold">Our purpose is to change that.</span>
            </p>
          </div>
        </section>

        {/* 2. THE ROOTS (History) */}
        <section className="py-24 px-6 relative border-t border-white/5 bg-surface/20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
               <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full" />
               <div className="relative bg-[#0b0f19] border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <History size={32} className="text-cyan-400" />
                    <h3 className="text-2xl font-black text-white">July 2020</h3>
                  </div>
                  <p className="text-slate-400 mb-4">
                    Founded by <strong>Tkprobix</strong>, <em>RubyApks</em> began with a simple promise: discover indie apps without barriers. No hidden costs, no gatekeeping.
                  </p>
                  <p className="text-slate-400">
                    It quickly became a trusted space for players seeking unique experiences and developers looking for visibility without friction.
                  </p>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">The Roots</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Evolving from its foundation platform, <strong>RubyApks</strong>, Rubies Unleashed represents the next step in a journey that began with simple discovery.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                RubyApks laid the foundation. <span className="text-ruby font-bold">Rubies Unleashed</span> is where that vision continues to grow.
              </p>
            </div>
          </div>
        </section>

        {/* 3. CORE VALUES */}
        <section className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Why It Matters</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">The values that built RubyApks remain central to us today.</p>
          </div>

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Zap size={32} className="text-amber-400" />}
              title="Creator-First"
              desc="Indie developers drive innovation. We remove restrictions so they can publish freely and reach a global audience on their own terms."
            />
            <ValueCard 
              icon={<Users size={32} className="text-cyan-400" />}
              title="Player-Focused"
              desc="Players deserve creativity, not repetition. We make it easy to discover niche titles and experimental projects that go unnoticed elsewhere."
            />
            <ValueCard 
              icon={<Shield size={32} className="text-emerald-400" />}
              title="Transparent"
              desc="No accounts required to browse. No hidden steps. Just discover, click, and download. Accessibility is a principle, not a feature."
            />
          </div>
        </section>

        {/* 4. THE RUBIES ECONOMY (Gamified) */}
        <section className="py-24 px-6 bg-[#161b2c] border-y border-white/5 relative overflow-hidden">
          {/* ✅ FIXED: Use canonical h-125 w-125 */}
          <div className="absolute top-0 right-0 w-125 h-125 bg-ruby/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ruby/20 border border-ruby/50 mb-6 animate-pulse">
                <Gem size={32} className="text-ruby" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">The Rubies Economy</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                A digital currency designed to support a healthier relationship between creators and users—without aggressive monetization.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Card 1: Earn */}
              <div className="bg-black/40 p-8 rounded-3xl border border-white/10 hover:border-ruby/30 transition-all flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy size={120} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                  <Trophy className="text-amber-400" size={24} /> Play to Earn
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Earn Rubies through community participation, completing platform goals, and joining events. The more you engage, the more you earn.
                </p>
              </div>

              {/* Card 2: Spend & Support */}
              <div className="bg-black/40 p-8 rounded-3xl border border-white/10 hover:border-ruby/30 transition-all flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Heart size={120} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                  <Heart className="text-ruby" size={24} /> Support Creators
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Use your Rubies to unlock exclusive content or tip your favorite developers directly. It's transparent support that rewards creativity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PUBLISHING SUPPORT & COMMUNITY */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            
            {/* Publishing Support */}
            <div className="bg-surface/30 p-8 rounded-3xl border border-white/5">
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <Crown size={24} className="text-cyan-400" /> Publishing Support
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                We provide platform-backed releases for creators whose work shows strong potential. This includes increased visibility, promotional opportunities, and a clear path from experimentation to recognition.
              </p>
              <Link href="https://forms.gle/i7X2sUJ5cnqsUciA6" className="text-cyan-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors flex items-center gap-2">
                Learn about Publishing <ArrowRight size={14} />
              </Link>
            </div>

            {/* Community */}
            <div className="bg-surface/30 p-8 rounded-3xl border border-white/5">
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <Users size={24} className="text-ruby" /> Shared Space
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Rubies Unleashed is not a closed system. We actively support community challenges and creative initiatives. Feedback from creators and users directly influences how the platform evolves.
              </p>
              <Link href="/contact" className="text-ruby font-bold uppercase tracking-widest text-xs hover:text-white transition-colors flex items-center gap-2">
                Join the Discussion <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </section>

        {/* 6. THE PROMISE (CTA) */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              Our Promise
            </h2>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              We are committed to building a platform that respects creators, values players, and grows through trust rather than pressure. <br/><br/>
              <span className="text-white font-bold">Rubies Unleashed is here to support that journey.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/explore"
                className="px-8 py-4 bg-ruby text-white font-black rounded-xl uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_0_30px_rgba(224,17,95,0.3)] hover:shadow-[0_0_50px_rgba(224,17,95,0.5)] transform hover:-translate-y-1"
              >
                Join the Community
              </Link>
              <Link 
                href="https://forms.gle/i7X2sUJ5cnqsUciA6"
                className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Start Publishing
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="bg-surface/50 p-8 rounded-3xl border border-white/5 hover:border-ruby/30 transition-all group hover:-translate-y-1 duration-300">
      <div className="mb-6 bg-black/40 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wide">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium text-sm">
        {desc}
      </p>
    </div>
  );
}