"use client";

import Link from "next/link";
import { User, Monitor, ShieldCheck } from "lucide-react";
import { getPlatformInfo, getLicenseType, getSocialIcon, getTagStyle } from "@/lib/game-utils";

export default function GameSidebar({ game }) {
  // --- NUCLEAR SAFETY CHECK ---
  // 1. If game is falsy, return nothing.
  if (!game) return null;

  // 2. Normalize inputs to prevent "undefined" access errors
  // We create local variables guaranteed to be the right type.
  const safeTags = (game && Array.isArray(game.tags)) ? game.tags : [];
  const safeDeveloper = (game && game.developer) ? game.developer : "Unknown";
  const safeSocials = (game && Array.isArray(game.socialLinks)) ? game.socialLinks : [];

  // 3. Run Helpers with Safe Data
  const platform = getPlatformInfo(game, safeTags);
  const license = getLicenseType(safeTags);

  return (
    <div className="space-y-8">
      <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5 sticky top-24">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Game Info</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 text-slate-400">
                <User size={18} /> <span className="text-sm font-bold">Developer</span>
            </div>
            <span className="text-white font-bold truncate max-w-40" title={safeDeveloper}>
                {safeDeveloper}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 text-slate-400">
                <Monitor size={18} /> <span className="text-sm font-bold">Platform</span>
            </div>
            <span className="text-white font-bold truncate max-w-40" title={platform.name}>
                {platform.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={18} /> <span className="text-sm font-bold">License</span>
            </div>
            <span className={`font-bold ${license.color}`}>
                {license.text}
            </span>
          </div>
        </div>

        {safeSocials.length > 0 && (
          <div className="mt-8 border-t border-white/5 pt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Connect</h3>
            <div className="flex flex-col gap-2">
              {safeSocials.map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all">
                  <span className="text-ruby">{getSocialIcon(social.label)}</span>
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {safeTags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {safeTags.map((tag) => {
                const tagStyle = getTagStyle(tag);
                return (
                  <Link key={tag} href={`/explore?q=${tag}`} className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all border ${tagStyle} hover:scale-105`}>
                    #{tag}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}