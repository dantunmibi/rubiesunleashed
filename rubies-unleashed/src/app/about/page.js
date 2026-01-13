/**
 * ================================================================
 * ABOUT PAGE - The Manifesto (Current Reality Edition)
 * ================================================================
 *
 * Purpose:
 * - Tells the story of RubyApks -> Rubies Unleashed
 * - Explains the mission, values, and current capabilities
 * - Reflects actual Phase 4 implementation (The Forge)
 * - Removes unimplemented features (Ruby Economy)
 * - Cinematic, digestible layout
 * ================================================================
 */

"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import {
  Gem,
  Users,
  Zap,
  Shield,
  ArrowRight,
  History,
  Heart,
  Crown,
  Wrench,
  Upload,
  Search
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-ruby/30 selection:text-white overflow-x-hidden">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10">
        {/* 1. HERO - THE VISION */}
        <section className="relative pt-40 pb-20 px-6 lg:px-8 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-ruby/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ruby/10 border border-ruby/30 rounded-full mb-8 font-bold text-sm text-ruby uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Gem size={14} />
              <span>Our Purpose</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight text-white leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              CREATIVITY <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-ruby to-rose-500">
                UNLEASHED
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              We believe independent creators are the source of the most
              original ideas in technology. Too often, they are buried by
              algorithms. <br />
              <span className="text-white font-bold">
                Our purpose is to change that.
              </span>
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
                  Founded by <strong>Tkprobix</strong>, <em>RubyApks</em> began
                  with a simple promise: discover indie apps without barriers.
                  No hidden costs, no gatekeeping.
                </p>
                <p className="text-slate-400">
                  It quickly became a trusted space for players seeking unique
                  experiences and developers looking for visibility without
                  friction.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                The Evolution
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Evolving from its foundation platform, <strong>RubyApks</strong>,
                Rubies Unleashed now combines curated discovery with 
                <span className="text-emerald-400 font-bold"> community-driven publishing</span>.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                What started as a showcase has become a full creator ecosystem where 
                developers can publish directly alongside curated content.
              </p>
            </div>
          </div>
        </section>

        {/* 3. CORE VALUES */}
        <section className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Why It Matters
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we build.
            </p>
          </div>

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Zap size={32} className="text-amber-400" />}
              title="Creator-First"
              desc="Indie developers drive innovation. We provide tools for direct publishing, project management, and community building without restrictive gatekeeping."
            />
            <ValueCard
              icon={<Users size={32} className="text-cyan-400" />}
              title="Player-Focused"
              desc="Players deserve creativity, not repetition. Our unified discovery system surfaces both curated gems and fresh community projects in one place."
            />
            <ValueCard
              icon={<Shield size={32} className="text-emerald-400" />}
              title="Transparent"
              desc="Browse without barriers. Download with confidence. Our external link warnings and content moderation keep the experience safe and honest."
            />
          </div>
        </section>

        {/* 4. WHAT WE OFFER TODAY */}
        <section className="py-24 px-6 bg-[#161b2c] border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-125 h-125 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 mb-6">
                <Wrench size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                The Platform Today
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                A complete ecosystem for discovering and publishing independent games and applications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Creators */}
              <div className="bg-black/40 p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Upload size={120} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                  <Upload className="text-emerald-400" size={24} /> For Creators
                </h3>
                <ul className="text-slate-400 leading-relaxed space-y-2">
                  <li>• <strong>Direct Publishing:</strong> Upload projects with full control</li>
                  <li>• <strong>Asset Management:</strong> Host images, videos, and files</li>
                  <li>• <strong>Creator Dashboards:</strong> Manage your portfolio</li>
                  <li>• <strong>Public Profiles:</strong> Showcase your work</li>
                </ul>
              </div>

              {/* For Players */}
              <div className="bg-black/40 p-8 rounded-3xl border border-white/10 hover:border-ruby/30 transition-all flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Search size={120} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                  <Search className="text-ruby" size={24} /> For Players
                </h3>
                <ul className="text-slate-400 leading-relaxed space-y-2">
                  <li>• <strong>Unified Discovery:</strong> Curated + community content</li>
                  <li>• <strong>Personal Wishlists:</strong> Save and organize favorites</li>
                  <li>• <strong>Advanced Search:</strong> Find exactly what you want</li>
                  <li>• <strong>Safe Downloads:</strong> External link warnings</li>
                </ul>
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
                <Crown size={24} className="text-emerald-400" /> The Forge
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Our creator platform provides everything needed to publish and manage projects. 
                From initial upload to community engagement, creators have full control over 
                their content and presentation.
              </p>
              <Link
                href="/publish"
                className="text-emerald-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors flex items-center gap-2"
              >
                Start Publishing <ArrowRight size={14} />
              </Link>
            </div>

            {/* Community */}
            <div className="bg-surface/30 p-8 rounded-3xl border border-white/5">
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <Users size={24} className="text-ruby" /> Open Community
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Rubies Unleashed thrives on community feedback and collaboration. 
                Whether you're a creator seeking visibility or a player discovering 
                new experiences, you're part of shaping the platform's future.
              </p>
              <Link
                href="/contact"
                className="text-ruby font-bold uppercase tracking-widest text-xs hover:text-white transition-colors flex items-center gap-2"
              >
                Join the Discussion <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. THE PROMISE (CTA) */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              Our Commitment
            </h2>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              We are building a platform that respects creators, values players, 
              and grows through trust rather than pressure. Every feature we add 
              serves this mission. <br />
              <br />
              <span className="text-white font-bold">
                Rubies Unleashed is here to support independent creativity.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/explore"
                className="px-8 py-4 bg-ruby text-white font-black rounded-xl uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_0_30px_rgba(224,17,95,0.3)] hover:shadow-[0_0_50px_rgba(224,17,95,0.5)] transform hover:-translate-y-1"
              >
                Explore Content
              </Link>
              <Link
                href="/publish"
                className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Start Creating
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
      <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed font-medium text-sm">
        {desc}
      </p>
    </div>
  );
}