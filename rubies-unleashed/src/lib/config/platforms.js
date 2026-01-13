import {
  Monitor,
  Smartphone,
  Globe,
  Apple,
  Command,
  Box,
} from "lucide-react";

// ✅ STANDARDIZED: Match ProjectEditor platform options
export const PLATFORMS = {
  Windows: {
    icon: Monitor,
    label: "Windows",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    hoverColor: "hover:bg-blue-500/20 hover:border-blue-500",
  },
  Mac: {
    icon: Command, // ✅ Match ProjectEditor
    label: "Mac",
    color: "bg-slate-500/10 border-slate-500/30 text-slate-400",
    hoverColor: "hover:bg-slate-500/20 hover:border-slate-500",
  },
  Linux: {
    icon: Box, // ✅ Match ProjectEditor
    label: "Linux",
    color: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    hoverColor: "hover:bg-orange-500/20 hover:border-orange-500",
  },
  Web: {
    icon: Globe,
    label: "Web",
    color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    hoverColor: "hover:bg-purple-500/20 hover:border-purple-500",
  },
  Android: {
    icon: Smartphone,
    label: "Android",
    color: "bg-green-500/10 border-green-500/30 text-green-400",
    hoverColor: "hover:bg-green-500/20 hover:border-green-500",
  },
  iOS: {
    icon: Apple,
    label: "iOS",
    color: "bg-slate-500/10 border-slate-500/30 text-slate-400",
    hoverColor: "hover:bg-slate-500/20 hover:border-slate-500",
  },
};

// ✅ ADD: Platform categories for grouping (optional)
export const PLATFORM_CATEGORIES = {
  Desktop: ['Windows', 'Mac', 'Linux'],
  Mobile: ['Android', 'iOS'],
  Web: ['Web']
};