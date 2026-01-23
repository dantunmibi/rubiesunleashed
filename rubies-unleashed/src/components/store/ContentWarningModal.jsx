"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getGameTheme } from "@/lib/theme-utils"; // ✅ Modular Theme

export default function ContentWarningModal({ warnings, gameId, gameType, gameAgeRating }) { // ✅ Add prop for age rating
  const [isOpen, setIsOpen] = useState(false);

  // --- 🎨 THEME ENGINE ---
  const theme = getGameTheme(gameType);

useEffect(() => {
  // Check if user has already acknowledged this game's warning
  const acknowledgedGames = JSON.parse(
    localStorage.getItem("ruby_warning_acknowledged") || "[]"
  );

  // ✅ NEW: Only show modal for Mature/Adults Only content
  const isMatureContent = 
    gameAgeRating?.toLowerCase().includes('mature') || 
    gameAgeRating?.toLowerCase().includes('adults only');

  // Show modal if: not acknowledged AND content is mature
  if (!acknowledgedGames.includes(gameId) && isMatureContent) {
    setIsOpen(true);
  }
}, [gameId, gameAgeRating]); // ✅ Add gameAgeRating to dependencies

  const handleAcknowledge = () => {
    // Save acknowledgment to localStorage
    const acknowledgedGames = JSON.parse(
      localStorage.getItem("ruby_warning_acknowledged") || "[]"
    );
    acknowledgedGames.push(gameId);
    localStorage.setItem("ruby_warning_acknowledged", JSON.stringify(acknowledgedGames));
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Go back to explore page
    window.history.back();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 animate-in fade-in duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
        <div className={`bg-[#161b2c] border-2 rounded-2xl shadow-2xl max-w-lg w-full relative animate-in fade-in zoom-in duration-300 ${theme.border} ${theme.shadow}`}>
          
          {/* Accent bar at top */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent ${theme.lineGradient} to-transparent rounded-t-2xl`} />
          
          {/* Content */}
          <div className="p-8">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`absolute inset-0 blur-xl rounded-full animate-pulse ${theme.bg.replace('bg-', 'bg-')}/20`} />
                <div className={`relative ${theme.bgLight} p-5 rounded-full border-2 ${theme.border}`}>
                  <ShieldAlert size={56} className={theme.text} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
              Content Warning
            </h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              Please review the following before proceeding
            </p>

            {/* Warnings List */}
            <div className="space-y-3 mb-8">
              {warnings.map((warning, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-3 bg-black/40 border border-white/5 p-4 rounded-xl ${theme.borderHover} transition-colors`}
                >
                  <AlertTriangle size={20} className={`shrink-0 mt-0.5 ${theme.text}`} />
                  <span className="text-slate-200 text-sm leading-relaxed">{warning}</span>
                </div>
              ))}
            </div>

            {/* Message */}
            <div className={`${theme.bgLight} border ${theme.border} rounded-lg p-4 mb-6`}>
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                This content may not be suitable for all audiences. By continuing, you acknowledge that you understand these warnings.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl font-bold transition-all active:scale-95 hover:border-slate-500"
              >
                Go Back
              </button>
              <button
                onClick={handleAcknowledge}
                className={`flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg ${theme.bg} hover:brightness-110 ${theme.glow}`}
              >
                I Understand
              </button>
            </div>

            {/* Small print */}
            <p className="text-xs text-slate-500 text-center mt-4">
              Your acknowledgment will be saved for this session
            </p>
          </div>
        </div>
      </div>
    </>
  );
}