"use client";

/* 
  💎 RUBIES UNLEASHED - Publish Page (The Architect Protocol)
  -----------------------------------------------------------
  - Onboarding page for Developers & Creators.
  - Converts regular users to architects via first project creation.
  - Theme: Architect (Emerald).
*/

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToastContext } from "@/components/providers/ToastProvider";
import { supabase } from "@/lib/supabase";
import { notifyProjectCreated } from "@/lib/projectNotifications";
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay"; // ✅ ADD THIS
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { generateSlug } from "@/lib/game-utils";
import {
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  ExternalLink,
  Code,
  UserPlus,
  Rocket,
  Loader2,
  ArrowRight,
  Crown,
  Sparkles
} from "lucide-react";

export default function PublishPage() {
  const { user, profile, refreshProfile, getDeveloperName } = useAuth();
  const { showToast } = useToastContext();
  const router = useRouter();
  
  // ✅ ADD SESSION GUARD
  const { showSessionError, triggerError } = useSessionGuard(); // ✅ GET VISIBILITY STATE
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");

    useEffect(() => {
    let timer;
    if (creating) {
      timer = setTimeout(() => {
        console.warn("Project creation timed out. Triggering session recovery.");
        setCreating(false);
        if (triggerError) triggerError();
      }, 4000); // 4 second timeout
    }
    return () => clearTimeout(timer);
  }, [creating, triggerError]);

  // Check if user should see onboarding vs external form
  useEffect(() => {
    if (user && profile) {
      // Show onboarding if user is authenticated but not an architect yet
      setShowOnboarding(!profile.role || profile.role === 'user');
    }
  }, [user, profile]);

const handleCreateFirstProject = async (e) => {
  e.preventDefault();
  
  if (!projectTitle.trim()) {
    showToast("Project title is required", "error");
    return;
  }

  setCreating(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      showToast("Please log in to continue", "error");
      router.push("/login");
      return;
    }

    const res = await fetch('/api/projects/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        title: projectTitle.trim(),
        developer: profile?.username || "Indie Developer" 
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create project");
    }

    const { project } = await res.json();

    // Auto-promote user to architect
    const profileRes = await fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        role: 'architect',
        archetype: profile?.archetype || 'architect'
      })
    });

    if (profileRes.ok) {
      await refreshProfile();
    }

    notifyProjectCreated(project);
    showToast("🎉 Welcome to The Forge! You're now an Architect!", "success");
    
    const username = user?.user_metadata?.username || 
                    profile?.username || 
                    user?.email?.split('@')[0] || 
                    'user';
    
    router.push(`/${username}/dashboard/project/${project.id}/edit`);

  } catch (error) {
    console.error('Create project error:', error);
    showToast(error.message || "Failed to create project", "error");
  } finally {
    setCreating(false);
  }
};

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-architect-light/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Ambient Background - Architect Theme */}
        <div className="absolute inset-0 pointer-events-none">
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
            {showOnboarding ? (
              <>
                Ready to become an <span className="text-architect font-bold">Architect</span>? 
                Create your first project and join the elite creators in The Forge.
              </>
            ) : (
              <>
                Join the ecosystem. Submit your games and tools to a dedicated
                audience of power users. No gatekeepers. No hidden fees.
                Just pure distribution.
              </>
            )}
          </p>

{/* CTAs */}
{showOnboarding ? (
  /* --- ONBOARDING CTA --- */
  <div className="max-w-md mx-auto">

    <form onSubmit={handleCreateFirstProject} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Enter your project title..."
          className="w-full px-6 py-4 bg-surface border border-architect/30 rounded-xl text-white placeholder:text-slate-500 focus:border-architect focus:outline-none focus:ring-2 focus:ring-architect/20 transition-all"
          disabled={creating}
          autoFocus
        />
      </div>
      
      <button
        type="submit"
        disabled={creating || !projectTitle.trim()}
        className="w-full px-8 py-4 bg-architect hover:bg-architect-dark text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_var(--color-architect-glow)] hover:shadow-[0_0_30px_var(--color-architect-glow)] hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {creating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Initializing...
          </>
        ) : (
          <>
            <Crown size={16} />
            Become an Architect
          </>
        )}
      </button>
    </form>
    
    <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
      <Sparkles size={12} />
      This will create your first project and unlock The Forge
    </p>
  </div>
) : user ? (
  /* --- EXISTING ARCHITECT --- */
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Link
      href={`/${user?.user_metadata?.username || profile?.username || user?.email?.split('@')[0] || 'user'}/dashboard`}
      className="px-8 py-4 bg-architect hover:bg-architect-dark text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_var(--color-architect-glow)] hover:shadow-[0_0_30px_var(--color-architect-glow)] hover:-translate-y-1 flex items-center justify-center gap-2"
    >
      <Terminal size={16} />
      Open The Forge
    </Link>
    <Link
      href="#protocol"
      className="px-8 py-4 bg-surface border border-white/10 hover:border-architect/50 text-slate-300 font-bold uppercase tracking-widest text-sm rounded-xl transition-all hover:bg-white/5 flex items-center justify-center gap-2"
    >
      Learn More
    </Link>
  </div>
) : (
  /* --- GUEST USER --- */
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Link
      href="/signup"
      className="px-8 py-4 bg-architect hover:bg-architect-dark text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_var(--color-architect-glow)] hover:shadow-[0_0_30px_var(--color-architect-glow)] hover:-translate-y-1 flex items-center justify-center gap-2"
    >
      <UserPlus size={16} />
      Join The Forge
    </Link>
    <Link
      href="#protocol"
      className="px-8 py-4 bg-surface border border-white/10 hover:border-architect/50 text-slate-300 font-bold uppercase tracking-widest text-sm rounded-xl transition-all hover:bg-white/5 flex items-center justify-center gap-2"
    >
      Learn More
    </Link>
  </div>
)}
        </div>
      </section>

      {/* --- ARCHITECT BENEFITS (Only show for onboarding) --- */}
      {showOnboarding && (
        <section className="py-20 bg-surface/30 border-y border-white/5">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-12 text-center">
              Architect <span className="text-architect">Privileges</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ArchitectBenefit
                icon={<Terminal size={32} />}
                title="The Forge Access"
                desc="Full project management dashboard with analytics, version control, and instant publishing."
              />
              <ArchitectBenefit
                icon={<Zap size={32} />}
                title="Instant Publishing"
                desc="No approval process. Your projects go live immediately with full SEO optimization."
              />
              <ArchitectBenefit
                icon={<Crown size={32} />}
                title="Creator Badge"
                desc="Special architect badge on your profile and projects, marking you as a verified creator."
              />
            </div>
          </div>
        </section>
      )}

      {/* --- BENEFITS GRID (Original) --- */}
      <section
        id="protocol"
        className="py-20 bg-surface/30 border-y border-white/5 scroll-mt-32"
      >
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

{/* --- SUBMISSION SEQUENCE (Updated for onboarding) --- */}
<section className="py-24 relative">
  <div className="container mx-auto px-6 max-w-4xl">
    <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-16 text-center">
      {showOnboarding ? "Architect Onboarding" : "Publishing Process"}
    </h2>

    <div className="space-y-12 relative">
      {/* Connecting Line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10 hidden md:block" />

      {showOnboarding ? (
        <>
          <Step
            num="01"
            title="Create First Project"
            desc="Enter your project title above to initialize your first project and unlock architect privileges."
          />
          <Step
            num="02"
            title="Access The Forge"
            desc="Get instant access to your personal dashboard with project management, analytics, and publishing tools."
          />
          <Step
            num="03"
            title="Build & Deploy"
            desc="Use the project editor to add details, upload media, and publish your project to the global feed."
          />
        </>
      ) : (
        <>
          <Step
            num="01"
            title="Initialize Project"
            desc="Create your project in The Forge with title, description, and media assets."
          />
          <Step
            num="02"
            title="Configure Distribution"
            desc="Add download links, platform support, and technical specifications."
          />
          <Step
            num="03"
            title="Instant Deployment"
            desc="Hit publish and your project goes live immediately on the global feed with full SEO optimization."
          />
        </>
      )}
    </div>
  </div>
</section>
      {/* --- CTA FOOTER --- */}
      <section className="py-20 border-t border-white/5 bg-linear-to-b from-surface to-background text-center">
        <div className="container mx-auto px-6">
          <Code size={48} className="text-architect mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">
            Ready to deploy?
          </h2>
          
          {showOnboarding ? (
            <p className="text-slate-400 mb-6">
              Join thousands of creators who have already unlocked The Forge
            </p>
          ) : user ? (
            <Link
              href={`/${user.user_metadata?.username || 'user'}/dashboard`}
              className="inline-flex items-center gap-2 text-architect-light hover:text-architect font-bold uppercase tracking-widest border-b border-architect/30 hover:border-architect pb-1 transition-colors"
            >
              Open The Forge <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="https://forms.gle/i7X2sUJ5cnqsUciA6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-architect-light hover:text-architect font-bold uppercase tracking-widest border-b border-architect/30 hover:border-architect pb-1 transition-colors"
            >
              Open Submission Form <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </section>
      <SessionErrorOverlay show={showSessionError} />
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

function ArchitectBenefit({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-2xl bg-architect/5 border border-architect/20 hover:border-architect/40 transition-all group">
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
        <p className="text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
          