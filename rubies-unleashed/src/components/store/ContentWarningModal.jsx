"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";

export default function ContentWarningModal({ warnings, gameId }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged this game's warning
    const acknowledgedGames = JSON.parse(
      localStorage.getItem("ruby_warning_acknowledged") || "[]"
    );

    if (!acknowledgedGames.includes(gameId)) {
      setIsOpen(true);
    }
  }, [gameId]);

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
        <div className="bg-[#161b2c] border-2 border-ruby/50 rounded-2xl shadow-2xl shadow-ruby/20 max-w-lg w-full relative animate-in fade-in zoom-in duration-300">
          
          {/* Red accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-ruby via-red-500 to-ruby rounded-t-2xl" />
          
          {/* Content */}
          <div className="p-8">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-ruby/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-ruby/10 p-5 rounded-full border-2 border-ruby/30">
                  <ShieldAlert size={56} className="text-ruby" strokeWidth={2} />
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
                  className="flex items-start gap-3 bg-black/40 border border-white/5 p-4 rounded-xl hover:border-ruby/30 transition-colors"
                >
                  <AlertTriangle size={20} className="text-ruby shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-sm leading-relaxed">{warning}</span>
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="bg-ruby/5 border border-ruby/20 rounded-lg p-4 mb-6">
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
                className="flex-1 px-6 py-3 bg-ruby hover:bg-ruby/90 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-ruby/20 hover:shadow-ruby/30"
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