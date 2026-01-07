import { Gamepad2, Box } from "lucide-react";

export const getGameTheme = (type) => {
  const isApp = type === 'App';
  
  return {
    isApp,
    text: isApp ? "text-cyan-400" : "text-ruby",
    bg: isApp ? "bg-cyan-600" : "bg-ruby",
    bgLight: isApp ? "bg-cyan-500/10" : "bg-ruby/10",
    border: isApp ? "border-cyan-500/30" : "border-ruby/30",
    borderHover: isApp ? "hover:border-cyan-500" : "hover:border-ruby",
    shadow: isApp ? "shadow-[0_0_60px_rgba(6,182,212,0.1)]" : "shadow-[0_0_60px_rgba(224,17,95,0.1)]",
    glow: isApp ? "shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "shadow-[0_0_20px_rgba(224,17,95,0.4)]",
    gradient: isApp ? "from-cyan-500/20" : "from-ruby/20",
    lineGradient: isApp ? "via-cyan-500" : "via-ruby",
    icon: isApp ? Box : Gamepad2,
    badge: isApp ? "SOFTWARE" : "GAME"
  };
};