/**
 * ================================================================
 * AUTH MODAL - Authentication Gate
 * ================================================================
 * 
 * Purpose:
 * - Prompts users to authenticate before wishlist actions
 * - Offers Sign Up / Log In / Continue as Guest
 * - Beautiful, cinematic design matching app theme
 * 
 * Props:
 * - isOpen: boolean - Controls modal visibility
 * - onClose: function - Called when modal closes
 * - onContinueAsGuest: function - Called when user chooses guest mode
 * - message: string (optional) - Custom prompt message
 * 
 * Features:
 * - Responsive design (mobile-first)
 * - Ruby-themed animations
 * - Body scroll lock when open
 * - Keyboard accessible (ESC to close)
 * ================================================================
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Gem, LogIn, UserPlus, User } from "lucide-react";

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onContinueAsGuest,
  message = "Join the vault to save your favorite gems and unlock exclusive features!" 
}) {
  const router = useRouter();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignUp = () => {
    onClose();
    router.push("/signup");
  };

  const handleLogIn = () => {
    onClose();
    router.push("/login");
  };

  const handleGuest = () => {
    onContinueAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b0f19]/95 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#161b2c] border border-ruby/20 rounded-2xl shadow-[0_0_60px_rgba(224,17,95,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Ruby Glow Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-ruby to-transparent opacity-70" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-ruby/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-ruby/10 border border-ruby/30 p-5 rounded-2xl">
              <Gem size={48} className="text-ruby" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Join The <span className="text-ruby">Vault</span>
          </h2>

          {/* Message */}
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Sign Up (Primary) */}
            <button
              onClick={handleSignUp}
              className="w-full bg-ruby text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(224,17,95,0.3)] hover:shadow-[0_0_30px_rgba(224,17,95,0.5)] flex items-center justify-center gap-3 group"
            >
              <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
              Sign Up
            </button>

            {/* Log In (Secondary) */}
            <button
              onClick={handleLogIn}
              className="w-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-white/10 hover:border-ruby/30 transition-all flex items-center justify-center gap-3 group"
            >
              <LogIn size={20} className="group-hover:scale-110 transition-transform" />
              Log In
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Continue as Guest (Tertiary) */}
            <button
              onClick={handleGuest}
              className="w-full text-slate-400 hover:text-white font-medium uppercase tracking-wider py-3 px-6 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              <User size={16} className="group-hover:scale-110 transition-transform" />
              Continue as Guest
            </button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-slate-600 mt-6">
            Guest accounts are temporary and stored locally.
          </p>
        </div>
      </div>
    </div>
  );
}