"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Monitor,
  ShieldCheck,
  GitBranch,
  Calendar,
  AlertCircle,
  HardDrive,
  Flag, 
  CheckCircle,
} from "lucide-react";
import {
  getPlatformInfo,
  getLicenseType,
  getSocialIcon,
  getTagStyle,
} from "@/lib/game-utils";
import ReportModal from "@/components/store/ReportModal";
import ExternalLinkWarning from "@/components/ui/ExternalLinkWarning";

export default function GameSidebar({ game }) {
  // --- NUCLEAR SAFETY CHECK ---
  if (!game) return null;

  const [warningUrl, setWarningUrl] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Normalize inputs to prevent "undefined" access errors
  const safeTags = game && Array.isArray(game.tags) ? game.tags : [];
  const safeDeveloper = game && game.developer ? game.developer : "Unknown";
  const safeSocials = game && Array.isArray(game.socialLinks) ? game.socialLinks : [];

  // ✅ DETERMINE SOURCE: Supabase items are verified, Blogger items are not
  const isSupabaseProject = game.source === 'supabase';
  const isBloggerProject = !isSupabaseProject; // Legacy Blogger content

  // Run Helpers with Safe Data
  const platform = getPlatformInfo(game, safeTags);
  const license = getLicenseType(safeTags);

  // Social link handler (same as before)
  const handleSocialClick = (e, url) => {
    e.preventDefault();
    
    const trustedSocialDomains = [
      'discord.com', 'discord.gg', 'twitter.com', 'x.com', 'youtube.com', 'youtu.be',
      'twitch.tv', 'reddit.com', 'facebook.com', 'instagram.com',
      'ko-fi.com', 'patreon.com', 'bandcamp.com', 'soundcloud.com'
    ];
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      const isTrusted = trustedSocialDomains.some(trusted => 
        domain === trusted || domain.endsWith(`.${trusted}`)
      );
      
      if (isTrusted) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        setWarningUrl(url);
      }
    } catch (error) {
      setWarningUrl(url);
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5 sticky top-24 shadow-xl shadow-black/20">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">
            Game Info
          </h3>

          <div className="space-y-4">
          {/* Developer */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 text-slate-400">
              <User size={18} />
              <span className="text-sm font-bold">Developer</span>
            </div>
              
              {/* Link to Portfolio */}
              {game.developerUrl ? (
                  <Link 
                      href={game.developerUrl}
                      className="text-white font-bold text-right max-w-50 wrap-break-word hover:text-ruby transition-colors underline decoration-ruby/30 underline-offset-4"
                      title={`View more from ${safeDeveloper}`}
                  >
                      {safeDeveloper}
                  </Link>
              ) : (
                  <span className="text-white font-bold text-right max-w-50 wrap-break-word">
                      {safeDeveloper}
                  </span>
              )}
            </div>

            {/* Platform */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Monitor size={18} />
                <span className="text-sm font-bold">Platform</span>
              </div>
              <span
                className="text-white font-bold truncate max-w-35 text-right"
                title={platform.name}
              >
                {platform.name}
              </span>
            </div>

            {/* Version - Only render if provided */}
            {game.version && (
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <GitBranch size={18} />
                  <span className="text-sm font-bold">Version</span>
                </div>
                <span className="text-white font-bold truncate max-w-35 text-right">
                  {game.version}
                </span>
              </div>
            )}

            {/* Published */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar size={18} />
                <span className="text-sm font-bold">Published</span>
              </div>
              <span className="text-white font-bold truncate max-w-35 text-right">
                {formatDate(game.publishedDate)}
              </span>
            </div>

            {game.size && (
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <HardDrive size={18} />
                  <span className="text-sm font-bold">Size</span>
                </div>
                <span className="text-white font-bold truncate max-w-35 text-right">
                  {game.size}
                </span>
              </div>
            )}

            {/* Age Rating - Only render if provided */}
            {game.ageRating && (
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <AlertCircle size={18} />
                  <span className="text-sm font-bold">Rating</span>
                </div>
                <span className="text-white font-bold truncate max-w-35 text-right">
                  {game.ageRating}
                </span>
              </div>
            )}

            {/* License */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={18} />
                <span className="text-sm font-bold">License</span>
              </div>
              <span className={`font-bold ${license.color}`}>{license.text}</span>
            </div>
          </div>

          {/* Social Links */}
          {safeSocials.length > 0 && (
            <div className="mt-8 border-t border-white/5 pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Connect
              </h3>
              <div className="flex flex-col gap-2">
                {safeSocials.map((social, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleSocialClick(e, social.url)}
                    className="flex items-center gap-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all group cursor-pointer text-left"
                  >
                    <span className="text-ruby group-hover:scale-110 transition-transform">
                      {getSocialIcon(social.label)}
                    </span>
                    {social.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {safeTags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeTags.map((tag) => {
                  const tagStyle = getTagStyle(tag);
                  return (
                    <Link
                      key={tag}
                      href={`/explore?q=${tag}`}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all border ${tagStyle} hover:scale-105 active:scale-95`}
                    >
                      #{tag}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

{/* --- SYSTEM UTILITIES --- */}
<div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
    
    {/* Report Button (Always show) */}
    <button 
        onClick={() => setShowReport(true)}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-black/20 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-xl transition-all group"
    >
        <Flag size={18} className="text-slate-500 group-hover:text-red-500 transition-colors" />
        <span className="text-[10px] font-bold text-slate-500 group-hover:text-red-400 uppercase tracking-widest">Report</span>
    </button>

    {/* ✅ Conditional Claim Button */}
    {isBloggerProject ? (
      <Link 
          href={`/contact?subject=Claim%20Request:%20${encodeURIComponent(game.title)}%20(ID:%20${game.id})`}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-black/20 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group"
      >
          <ShieldCheck size={18} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
          <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-400 uppercase tracking-widest">Claim</span>
      </Link>
    ) : (
      <div className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Verified</span>
      </div>
    )}

</div>
        </div>
      </div>

      {/* Warning modal for social links */}
      {warningUrl && (
        <ExternalLinkWarning
          url={warningUrl}
          onConfirm={() => {
            window.open(warningUrl, '_blank', 'noopener,noreferrer');
            setWarningUrl(null);
          }}
          onCancel={() => setWarningUrl(null)}
        />
      )}

      {/* Report modal */}
      {showReport && <ReportModal game={game} onClose={() => setShowReport(false)} />}
    </>
  );
}