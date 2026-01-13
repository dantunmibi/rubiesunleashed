import React from "react";
import { Monitor } from "lucide-react";
import { PLATFORMS } from "@/lib/config/platforms";

export default function PlatformSelector({
  selectedPlatform,
  onPlatformClick,
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        <Monitor size={12} /> Platform
      </div>

      {/* ✅ SIMPLIFIED: Flat platform list (no sub-platforms) */}
      <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => onPlatformClick("All")}
          className={`
            shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all
            ${
              selectedPlatform === "All"
                ? "bg-white text-black border-white shadow-lg scale-105"
                : "bg-surface/50 text-slate-400 border-white/10 hover:text-white hover:border-white/30"
            }
          `}
        >
          All Platforms
        </button>
        
        {Object.entries(PLATFORMS).map(([key, platform]) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === key;
          return (
            <button
              key={key}
              onClick={() => onPlatformClick(key)}
              className={`
                shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all
                ${
                  isSelected
                    ? `${platform.color} ${platform.hoverColor} scale-105 shadow-lg`
                    : `bg-surface/50 text-slate-400 border-white/10 ${platform.hoverColor}`
                }
              `}
            >
              <Icon size={14} /> {platform.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}