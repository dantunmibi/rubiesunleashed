"use client";

/* 
  💎 RUBIES UNLEASHED - Publish Page (The Architect Protocol)
  -----------------------------------------------------------
  - Landing page for Developers & Creators.
  - Theme: Architect (Emerald).
  - Uses global modular variables (--color-architect).
*/

import React from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ExternalLink,
  Code, 
  UserPlus
} from "lucide-react";

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-architect-light/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Ambient Background - Architect Theme */}
        <div className="absolute inset-0 pointer-events-none">
          {/* ✅ Fixed Canonical Class Warning & Switched to Architect Variable */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--color-architect-muted)_0%,transparent_60%)] opacity-30" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-architect/5 blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-architect/30 bg-architect/10 mb-8 backdrop-blur-md">
            <Terminal size={14} className="text-architect" />
            <span className="text-architect-light text-xs font-bold uppercase tracking-widest">
              The Architect Protocol
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6">
            Build. Deploy. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-architect-light to-architect">
              Unleash.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Join the ecosystem. Submit your games and tools to a dedicated audience of power users. 
            <br className="hidden md:block" /> No gatekeepers. No hidden fees. Just pure distribution.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://forms.gle/i7X2sUJ5cnqsUciA6"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-architect hover:bg-architect-dark text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_var(--color-architect-glow)] hover:shadow-[0_0_30px_var(--color-architect-glow)] hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Submit Project
              <ExternalLink size={16} />
            </Link>
            <Link
              href="#protocol"
              className="px-8 py-4 bg-surface border border-white/10 hover:border-architect/50 text-slate-300 font-bold uppercase tracking-widest text-sm rounded-xl transition-all hover:bg-white/5 flex items-center justify-center gap-2"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* --- BENEFITS GRID --- */}
      {/* ✅ Added scroll-mt-32 to handle Navbar offset */}
      <section id="protocol" className="py-20 bg-surface/30 border-y border-white/5 scroll-mt-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <FeatureCard 
              icon={<Globe size={32} />}
              title="Universal Visibility"
              desc="Your project is instantly indexed for search engines and distributed globally through our high-speed content network."
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />}
              title="Resilient Hosting"
              desc="We prioritize preservation. Once your project is added to the Vault, it is backed up and protected against link rot."
            />
            <FeatureCard 
              icon={<Zap size={32} />}
              title="Direct Access"
              desc="No proprietary launchers required. Users visit your official storefronts or download your binaries directly."
            />

          </div>
        </div>
      </section>

      {/* --- SUBMISSION SEQUENCE --- */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-16 text-center">
            Submission Sequence
          </h2>

          <div className="space-y-12 relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10 hidden md:block" />

            <Step 
              num="01" 
              title="Prepare Manifest" 
              desc="Ensure your project has a name, version, and valid download link (Itch.io, Mega, Drive, or Direct URL)."
            />
            <Step 
              num="02" 
              title="Submit Payload" 
              desc="Fill out the secure Google Form linked above. It takes less than 2 minutes to complete."
            />
            <Step 
              num="03" 
              title="Live Deployment" 
              desc="Our Architects verify the data. Your project goes live on the Vault typically within 24 hours."
            />
          </div>

        </div>
      </section>

      {/* --- FUTURE ROADMAP NOTE --- */}
      <section className="py-16 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-architect-muted/40 border border-architect/20 mb-6">
            <UserPlus size={16} className="text-architect-light" />
            <span className="text-architect-light text-xs font-bold uppercase tracking-widest">
              Phase 4: The Forge
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            Developer Accounts Coming Soon
          </h3>
          <p className="text-slate-400 leading-relaxed mb-0">
            We are currently building <strong>The Forge</strong> — a dedicated dashboard where you can manage your projects, track analytics, and update builds instantly. 
            <br className="mt-4" />
            <span className="text-architect">Early submitters via the form will get priority status</span> when accounts launch.
          </p>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-20 border-t border-white/5 bg-linear-to-b from-surface to-background text-center">
        <div className="container mx-auto px-6">
          <Code size={48} className="text-architect mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">
            Ready to deploy?
          </h2>
          <Link
             href="https://forms.gle/i7X2sUJ5cnqsUciA6"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-2 text-architect-light hover:text-architect font-bold uppercase tracking-widest border-b border-architect/30 hover:border-architect pb-1 transition-colors"
          >
            Open Submission Form <ExternalLink size={14} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-architect/30 transition-all group">
      <div className="text-architect mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-3">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-sm font-medium">
        {desc}
      </p>
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-6 md:gap-10 relative">
      <div className="shrink-0 w-12 h-12 rounded-full bg-surface border border-architect/30 flex items-center justify-center text-architect font-bold font-mono z-10 relative">
        {num}
        <div className="absolute inset-0 bg-architect/10 rounded-full animate-pulse" />
      </div>
      <div className="pt-2">
        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}