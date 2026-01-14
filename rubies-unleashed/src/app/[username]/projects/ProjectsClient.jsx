"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { processSupabaseProject } from "@/lib/game-utils";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay";
import {
  User,
  Loader2,
  AlertTriangle,
  Package,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  LayoutDashboard,
  Instagram,
  MessageCircle,
  Youtube,
} from "lucide-react";
import Link from "next/link";

// --- CUSTOM BACKGROUND ---
const ArchitectBackground = () => (
  <div className="fixed inset-0 -z-10 bg-[#0b0f19]">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/3 blur-[140px]" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/2 blur-[120px]" />
  </div>
);

export default function ProjectsClient({ username: propUsername }) {
  const { user } = useAuth();
  const targetUsername = decodeURIComponent(propUsername);

  // Hooks & State
  const { showSessionError, checkSupabaseError, triggerError } =
    useSessionGuard();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load Data
  useEffect(() => {
    let isMounted = true;
    if (!targetUsername) return;

    // Safety Timeout
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Loading timed out.");
        setLoading(false);
        if (triggerError) triggerError();
      }
    }, 8000);

    async function loadData() {
      try {
        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", targetUsername)
          .single();

        if (checkSupabaseError(profileError)) return;
        if (profileError || !profileData) throw new Error("Profile not found");

        if (isMounted) setProfile(profileData);

        // 2. Fetch Projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects_public")
          .select("*")
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false });

        if (checkSupabaseError(projectsError)) return;
        if (projectsError) throw projectsError;

        if (isMounted)
          setProjects((projectsData || []).map(processSupabaseProject));
      } catch (err) {
        console.error("Load Error:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
        clearTimeout(timer);
      }
    }

    loadData();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [targetUsername, checkSupabaseError, triggerError]); // Removed 'loading' from dep to avoid loop

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center">
        <Loader2
          className="animate-spin text-emerald-500 mb-4"
          size={32}
          strokeWidth={1.5}
        />
        <span className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase animate-pulse">
          Initializing System
        </span>
      </div>
    );
  }

// ✅ FIXED - Check role properly with better message
if (error || !profile) {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/5 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-2">
          Profile Not Found
        </h2>
        <p className="text-slate-500 text-xs font-mono">
          The requested user does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-2 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-full"
      >
        Return to Base
      </Link>
    </div>
  );
}

// ✅ SEPARATE CHECK: Show different message for non-architects
if (profile.role !== "architect" && profile.role !== "admin") {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
        <Package size={24} className="text-emerald-500" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-2">
          No Public Projects
        </h2>
        <p className="text-slate-500 text-xs font-mono">
          {profile.username} hasn't published any projects yet.
        </p>
      </div>
      <Link
        href={`/${profile.username}`}
        className="px-6 py-2 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-full"
      >
        View Profile
      </Link>
    </div>
  );
}

  const isOwner = user && user.id === profile.id;

  return (
    <div className="min-h-screen bg-transparent text-slate-300 font-sans selection:bg-emerald-500/30">
      <ArchitectBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* --- LEFT SIDEBAR: PROFILE --- */}
          <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-32 h-fit">
            <div className="relative group w-fit mx-auto lg:mx-0">
              <div className="w-48 h-48 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <User size={48} />
                  </div>
                )}
              </div>
              {/* Status Dot */}
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#0b0f19] rounded-full flex items-center justify-center border border-white/5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              </div>
            </div>

            <div className="space-y-6 text-center lg:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest mb-4">
                  <ShieldCheck size={10} /> Verified Architect
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-2">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-slate-500 font-mono text-xs">
                  // {profile.username.toUpperCase()}
                </p>
              </div>

              {/* ✅ USE ARCHITECT BIO */}
              <p className="text-slate-400 leading-relaxed text-sm font-light max-w-sm mx-auto lg:mx-0">
                {profile.architect_bio ||
                  profile.bio ||
                  "System data unavailable."}
              </p>

              {/* ✅ RENDER SOCIAL LINKS */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {isOwner && (
                  <Link
                    href={`/${profile.username}/dashboard`}
                    className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 rounded-xl transition-all"
                    title="Manage"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                )}

                {profile.social_links?.map((link, i) => {
                  const IconComponent = getSocialIcon(link.label);

                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="..."
                    >
                      {/* Render as Component */}
                      <IconComponent size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Stats Module */}
            <div className="bg-surface/40 border border-white/5 p-6 rounded-2xl font-mono space-y-4 backdrop-blur-sm">
              <div className="flex justify-between text-[10px] items-center">
                <span className="text-slate-500 uppercase tracking-wider">
                  System Status
                </span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
                  ONLINE
                </span>
              </div>
              <div className="flex justify-between text-[10px] items-center">
                <span className="text-slate-500 uppercase tracking-wider">
                  projects Deployed
                </span>
                <span className="text-white font-bold">{projects.length}</span>
              </div>
              <div className="flex justify-between text-[10px] items-center">
                <span className="text-slate-500 uppercase tracking-wider">
                  Joined
                </span>
                <span className="text-white">
                  {new Date(profile.created_at).getFullYear()}
                </span>
              </div>
              <div className="h-0.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>
          </aside>

          {/* --- RIGHT CONTENT: PORTFOLIO --- */}
          <section className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em]">
                  Projects
                </h2>
                <div className="h-px w-12 bg-emerald-500/50" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {projects.length} ENTRIES
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.length === 0 ? (
              <div className="col-span-full border border-dashed border-emerald-500/10 rounded-2xl p-20 flex flex-col items-center justify-center gap-4 bg-emerald-500/2">
                <Package size={48} className="text-emerald-500/30" />
                <div className="text-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-white block mb-2">
                    No Projects Yet
                  </span>
                  <p className="text-xs text-slate-500">
                    {isOwner ? "Publish your first project from The Forge" : "Check back soon for updates"}
                  </p>
                </div>
                {isOwner && (
                  <Link 
                    href={`/${profile.username}/dashboard`}
                    className="mt-4 px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2"
                  >
                    <Zap size={12} /> Create First Project
                  </Link>
                )}
              </div>
) : (
  projects.map((item) => (
    <Link
      key={item.id}
      href={`/view/${item.slug}`}
      className="group relative flex flex-col bg-[#0b0f19] border border-white/4 rounded-2xl overflow-hidden hover:border-emerald-500/20 hover:bg-white/1 transition-all duration-500 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-4/3 overflow-hidden bg-black">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale-20 group-hover:grayscale-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
            <Package size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-transparent to-transparent opacity-90" />

        {/* Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 bg-[#0b0f19]/80 backdrop-blur-md px-2 py-1 rounded border border-emerald-500/20">
            <Zap size={10} /> {item.type || "Module"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
            {item.platform || "Multi-Platform"}
          </p>
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
            {item.title}
          </h3>
        </div>
        <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-2 italic">
          "{item.description || "No description provided."}"
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {item.tags?.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className="text-[9px] font-mono text-slate-500 px-2 py-0.5 border border-white/5 rounded bg-white/2"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Link Indicator */}
        <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity group-hover:text-emerald-400">
          View Project
          <ChevronRight size={12} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  ))
)}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Session Overlay */}
      <SessionErrorOverlay show={showSessionError} />
    </div>
  );
}

function getSocialIcon(label, url) {
  const source = `${label ?? ""} ${url ?? ""}`.toLowerCase();

  if (source.includes("twitter") || source.includes("x.com")) return Twitter;
  if (source.includes("github")) return Github;
  if (source.includes("linkedin")) return Linkedin;
  if (source.includes("instagram")) return Instagram;
  if (source.includes("youtube")) return Youtube;
  if (source.includes("discord")) return MessageCircle;

  return Globe;
}
