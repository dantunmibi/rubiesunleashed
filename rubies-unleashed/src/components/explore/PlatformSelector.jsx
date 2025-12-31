import React from "react";
import { Monitor } from "lucide-react";
import { PLATFORMS } from "@/lib/config/platforms";

export default function PlatformSelector({
  selectedPlatform,
  selectedSubPlatform,
  onPlatformClick,
  onSubPlatformClick,
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        <Monitor size={12} /> Platform
      </div>

      {/* Main Platform Buttons */}
      <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => onPlatformClick("All")}
          className={`
            shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all
            ${
              selectedPlatform === "All" && !selectedSubPlatform
                ? "bg-white text-black border-white shadow-lg scale-105"
                : "bg-surface/50 text-slate-400 border-white/10 hover:text-white hover:border-white/30"
            }
          `}
        >
          All Platforms
        </button>
        {Object.entries(PLATFORMS).map(([key, platform]) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === key && !selectedSubPlatform;
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

      {/* Sub-Platform Buttons */}
      {selectedPlatform !== "All" && PLATFORMS[selectedPlatform] && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pl-4 animate-in slide-in-from-top-2 fade-in duration-300">
          {PLATFORMS[selectedPlatform].subPlatforms.map((subPlatform) => {
            const Icon = subPlatform.icon;
            const isSelected = selectedSubPlatform === subPlatform.id;
            return (
              <button
                key={subPlatform.id}
                onClick={() => onSubPlatformClick(subPlatform.id)}
                className={`
                  shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all
                  ${
                    isSelected
                      ? "bg-white text-black border-white shadow-md scale-105"
                      : "bg-surface/30 text-slate-400 border-white/5 hover:text-white hover:border-white/20"
                  }
                `}
              >
                <Icon size={12} /> {subPlatform.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
