"use client";

import React from "react";
import { Sparkles, Gamepad2, Box } from "lucide-react";

/**
 * WISHLIST STATS COMPONENT
 * 
 * Displays 3 metric cards showing wishlist breakdown.
 * Features:
 * - Total gems count ((--user-accent) accent)
 * - Games count (orange accent)
 * - Apps count (cyan accent)
 * - Responsive grid layout
 * - Animated entrance
 */

export default function WishlistStats({ stats }) {
  const cards = [
    {
      label: "Total Gems",
      value: stats.total,
      icon: <Sparkles size={24} />,
      gradient: "from-(--user-accent)/20 to-(--user-accent)/5",
      border: "border-(--user-accent)/30",
      text: "text-(--user-accent)",
      glow: "shadow-[0_0_30px_rgba(224,17,95,0.15)]",
    },
    {
      label: "Games",
      value: stats.games,
      icon: <Gamepad2 size={24} />,
      gradient: "from-orange-500/20 to-orange-500/5",
      border: "border-orange-500/30",
      text: "text-orange-400",
      glow: "shadow-[0_0_30px_rgba(249,115,22,0.15)]",
    },
    {
      label: "Apps",
      value: stats.apps,
      icon: <Box size={24} />,
      gradient: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`relative bg-linear-to-br ${card.gradient} backdrop-blur-xl border ${card.border} rounded-xl p-6 ${card.glow} transition-all hover:scale-105 hover:brightness-110`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Icon */}
          <div className={`${card.text} mb-3`}>
            {card.icon}
          </div>

          {/* Value */}
          <div className="text-4xl font-black text-white mb-1">
            {card.value}
          </div>

          {/* Label */}
          <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">
            {card.label}
          </div>

          {/* Decorative Glow */}
          <div className={`absolute -inset-0.5 bg-linear-to-br ${card.gradient} blur-xl opacity-20 -z-10 rounded-xl`} />
        </div>
      ))}
    </div>
  );
}