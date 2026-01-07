"use client";

import React from "react";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * EMPTY WISHLIST STATE
 *
 * Themed illustration shown when wishlist is empty.
 * Features:
 * - Animated ruby gem graphic
 * - Call-to-action to explore vault
 * - Smooth entrance animations
 */

export default function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      {/* Animated Gem Illustration */}
      <div className="relative mb-8">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-(--user-accent)/20 blur-3xl rounded-full animate-pulse" />

        {/* Gem Container */}
        <div className="relative">
          {/* Outer Ring */}
          <div
            className="absolute inset-0 border-2 border-(--user-accent)/30 rounded-full animate-spin-slow"
            style={{ width: "200px", height: "200px" }}
          />

          {/* Inner Gem */}
          <div className="relative w-50 h-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-br from-(--user-accent)/40 to-transparent rounded-full blur-xl" />
            <Heart
              size={80}
              className="text-(--user-accent) animate-pulse"
              strokeWidth={1.5}
            />
          </div>

          {/* Floating Sparkles */}
          <Sparkles
            size={24}
            className="absolute top-4 right-4 text-(--user-accent)/60 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <Sparkles
            size={16}
            className="absolute bottom-8 left-8 text-(--user-accent)/40 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          />
          <Sparkles
            size={20}
            className="absolute top-12 left-4 text-(--user-accent)/50 animate-bounce"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-slate-500 uppercase tracking-tighter mb-3">
        No Gems <span className="text-(--user-accent)">Saved Yet</span>
      </h2>

      {/* Description */}
      <p className="text-slate-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
        Your wishlist is empty. Start exploring the vault and save your favorite
        gems by clicking the{" "}
        <Heart size={16} className="inline text-(--user-accent)" fill="currentColor" />{" "}
        icon.
      </p>

      {/* CTA Button */}
      <Link
        href="/explore"
        className="group bg-(--user-accent) text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(224,17,95,0.3)] flex items-center gap-3 text-sm"
      >
        Explore Vault
        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
      </Link>

      {/* Decorative Line */}
      <div className="w-64 h-px bg-linear-to-r from-transparent via-(--user-accent)/30 to-transparent mt-12" />
    </div>
  );
}
