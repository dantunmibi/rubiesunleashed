/**
 * ================================================================
 * TOAST COMPONENT - Notification System
 * ================================================================
 * 
 * Purpose:
 * - Beautiful toast notifications matching app theme
 * - Auto-dismisses after duration
 * - Supports different types (success, error, info)
 * - Stacks multiple toasts
 * 
 * Features:
 * - Ruby-themed design
 * - Slide-in animations
 * - Click to dismiss
 * - Auto-dismiss timer
 * - Icon support
 * ================================================================
 */

"use client";

import { useEffect } from "react";
import { X, Check, Heart, AlertCircle, Info } from "lucide-react";

export default function Toast({ 
  message, 
  type = "success",
  onClose,
  duration = 3000,
  icon // ✅ Can be emoji string or Lucide component
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // ✅ NEW: Handle both emoji strings and Lucide icons
  const renderIcon = () => {
    // If custom emoji string provided (e.g., "💬", "⚠️")
    if (typeof icon === 'string') {
      return <span className="text-2xl">{icon}</span>;
    }
    
    // If Lucide component provided
    if (icon) {
      const CustomIcon = icon;
      return <CustomIcon size={20} />;
    }
    
    // Default icons by type
    switch (type) {
      case "success": return <Check size={20} />;
      case "error": return <AlertCircle size={20} />;
      case "wishlist": return <Heart size={20} fill="currentColor" />;
      default: return <Info size={20} />;
    }
  };

  // Color schemes
  const styles = {
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]"
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]"
    },
    wishlist: {
      bg: "bg-ruby/10",
      border: "border-ruby/30",
      text: "text-ruby",
      glow: "shadow-[0_0_20px_rgba(224,17,95,0.3)]"
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]"
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div 
      className={`
        ${style.bg} ${style.border} ${style.glow}
        border backdrop-blur-xl rounded-xl p-4 
        flex items-center gap-3 min-w-70 max-w-md
        animate-in slide-in-from-right-full fade-in duration-300
      `}
      onClick={onClose}
      role="alert"
    >
      {/* Icon */}
      <div className={`${style.text} shrink-0`}>
        {renderIcon()}
      </div>

      {/* Message */}
      <p className="text-white text-sm font-medium flex-1">
        {message}
      </p>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors shrink-0"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}