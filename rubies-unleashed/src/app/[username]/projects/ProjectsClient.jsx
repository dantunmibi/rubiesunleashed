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
  Github,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  MessageCircle,
  Youtube,
  ExternalLink,
  Settings,
  ImagePlus,
  Edit3,
  Link as LinkIcon,
  ArrowRight,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

// --- SCANLINE OVERLAY ---
const ScanlineOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />
  </div>
);

// --- SOCIAL ICON MAPPING ---
function getSocialIcon(label, url) {
  const source = `${label ?? ""} ${url ?? ""}`.toLowerCase();

  if (source.includes("twitter") || source.includes("x.com")) return Twitter;
  if (source.includes("github")) return Github;
  if (source.includes("linkedin")) return Linkedin;
  if (source.includes("instagram")) return Instagram;
  if (source.includes("youtube")) return Youtube;
  if (source.includes("discord")) return MessageCircle;
  if (source.includes("reddit")) return MessageSquare;

  return Globe;
}

export default function ProjectsClient({ username: propUsername }) {
  const { user } = useAuth();
  const targetUsername = decodeURIComponent(propUsername);

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

    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Loading timed out.");
        setLoading(false);
        if (triggerError) triggerError();
      }
    }, 10000);

    async function loadData() {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", targetUsername)
          .single();

        if (checkSupabaseError(profileError)) return;
        if (profileError || !profileData) throw new Error("Profile not found");

        if (isMounted) setProfile(profileData);

        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", profileData.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (checkSupabaseError(projectsError)) return;
        if (projectsError) {
          console.error("Projects fetch error:", projectsError);
        }

        if (isMounted) {
          const processedProjects = (projectsData || [])
            .map(processSupabaseProject)
            .filter((p) => p !== null);
          setProjects(processedProjects);
        }
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
  }, [targetUsername, checkSupabaseError, triggerError]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-ruby" size={48} />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full border-2 border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-slate-500 text-sm">This user doesn't exist.</p>
        </div>
        <Link
          href="/"
          className="px-6 py-3 bg-ruby hover:bg-ruby/90 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // --- NON-ARCHITECT CHECK ---
  if (profile.role !== "architect" && profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
          <Package size={24} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">No Projects Yet</h2>
          <p className="text-slate-500 text-sm">
            {profile.username} hasn't published any projects.
          </p>
        </div>
        <Link
          href={`/${profile.username}`}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
        >
          View Profile
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === profile.id;

  // Profile Completion Checks
  const needsAvatar = !profile.avatar_url;
  const needsBio = !profile.architect_bio && !profile.bio;
  const needsSocials =
    !profile.social_links || profile.social_links.length === 0;
  const profileIncomplete =
    isOwner && (needsAvatar || needsBio || needsSocials);

  return (
    <div className="min-h-screen bg-background text-slate-300 selection:bg-ruby/30">
      <ScanlineOverlay />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* --- SIDEBAR --- */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-32 h-fit">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative aspect-square w-full max-w-xs border-4 border-surface overflow-hidden shadow-2xl">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover transition-all duration-700"
                    alt={profile.username}
                  />
                ) : (
                  <div className="w-full h-full bg-surface flex flex-col items-center justify-center gap-4 text-slate-700">
                    <User size={64} />
                    {isOwner && (
                      <Link
                        href="/settings?tab=profile"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                      >
                        <ImagePlus size={14} /> Add Avatar
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  @{profile.username}
                </p>
              </div>

              {/* Bio */}
              {profile.architect_bio || profile.bio ? (
                <p className="text-base text-slate-400 leading-relaxed">
                  {profile.architect_bio || profile.bio}
                </p>
              ) : (
                isOwner && (
                  <div className="border border-dashed border-white/10 p-4 space-y-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-500">
                      Add a bio to tell visitors about yourself.
                    </p>
                    <Link
                      href="/settings?tab=architect"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <Edit3 size={12} /> Add Bio
                    </Link>
                  </div>
                )
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {/* Social Links - Smart Grid */}
                {profile.social_links && profile.social_links.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 w-full">
                    {profile.social_links.map((link, i) => {
                      const IconComponent = getSocialIcon(link.label, link.url);
                      const totalLinks = profile.social_links.length;

                      // ✅ Special styling for 5th and 6th links
                      const isLastRow = totalLinks === 5 && i === 4; // 5th link (index 4)
                      const isSixthLink = totalLinks === 6 && i >= 4; // 5th and 6th links

                      return (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
            h-12 border border-white/10 rounded-xl 
            flex items-center justify-center 
            hover:border-emerald-500/50 hover:text-emerald-500 
            transition-all
            ${isLastRow ? "col-span-4" : ""} 
            ${isSixthLink ? "col-span-2" : ""}
          `}
                        >
                          <IconComponent size={18} />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  isOwner && (
                    <Link
                      href="/settings?tab=architect"
                      className="col-span-4 border border-dashed border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-emerald-500/5 transition-all group"
                    >
                      <LinkIcon
                        size={20}
                        className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors"
                      />
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                          Add Social Links
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">
                          Connect your platforms in settings
                        </p>
                      </div>
                    </Link>
                  )
                )}
              </div>

              {/* Profile Completion */}
              {profileIncomplete && (
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Settings size={14} /> Complete Your Profile
                  </div>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {needsAvatar && <li>• Add a profile picture</li>}
                    {needsBio && <li>• Write a bio</li>}
                    {needsSocials && <li>• Add social links</li>}
                  </ul>
                  <Link
                    href="/settings?tab=architect"
                    className="block w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-white/5 rounded-xl p-4 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Projects
                </p>
                <p className="text-3xl font-black text-white">
                  {projects.length}
                </p>
              </div>
              <div className="bg-surface border border-white/5 rounded-xl p-4 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Joined
                </p>
                <p className="text-3xl font-black text-white">
                  {new Date(profile.created_at).getFullYear()}
                </p>
              </div>
            </div>
          </aside>

          {/* --- PROJECT GRID --- */}
          <section className="lg:col-span-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Published Projects
              </h2>
              <span className="text-xs font-mono text-slate-600">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                /* Empty State */
                <div className="col-span-full border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center gap-6 bg-white/5">
                  <Package size={64} className="text-slate-700" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-white mb-2">
                      No Projects Yet
                    </p>
                    <p className="text-sm text-slate-500">
                      {isOwner
                        ? "Start creating and publish your first project"
                        : "Check back soon for new releases"}
                    </p>
                  </div>
                  {isOwner && (
                    <Link
                      href={`/${profile.username}/dashboard`}
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-colors"
                    >
                      Create First Project
                    </Link>
                  )}
                </div>
              ) : (
                /* Project Cards */
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/view/${project.slug}`}
                    className="group relative"
                  >
                    {/* 2:3 Portrait Card */}
                    <div className="aspect-2/3 relative overflow-hidden bg-surface border border-white/5 rounded-2xl group-hover:border-emerald-500/30 transition-all duration-300">
                      {project.image ? (
                        <img
                          src={project.image}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                          alt={project.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Package size={48} />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/50 to-transparent" />

                      {/* Type Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {project.type || "Project"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                            {project.title}
                          </h3>
                          <div className="w-12 h-1 bg-emerald-500 group-hover:w-full transition-all duration-500" />
                        </div>
                        <p className="text-sm text-white font-medium line-clamp-2 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ArrowRight size={14} />
                        </div>
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
      <SessionErrorOverlay show={showSessionError} />
    </div>
  );
}
