import {
  Monitor,
  Smartphone,
  Globe,
  Apple,
  Laptop,
  Sparkles,
} from "lucide-react";

export const PLATFORMS = {
  PC: {
    icon: Monitor,
    label: "PC",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    hoverColor: "hover:bg-blue-500/20 hover:border-blue-500",
    subPlatforms: [
      { id: "Windows", label: "Windows", icon: Monitor },
      { id: "Mac", label: "macOS", icon: Apple },
      { id: "Linux", label: "Linux", icon: Laptop },
    ],
  },
  Mobile: {
    icon: Smartphone,
    label: "Mobile",
    color: "bg-green-500/10 border-green-500/30 text-green-400",
    hoverColor: "hover:bg-green-500/20 hover:border-green-500",
    subPlatforms: [
      { id: "Android", label: "Android", icon: Smartphone },
      { id: "iOS", label: "iOS", icon: Apple },
      { id: "HarmonyOS", label: "HarmonyOS", icon: Smartphone },
    ],
  },
  Web: {
    icon: Globe,
    label: "Web",
    color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    hoverColor: "hover:bg-purple-500/20 hover:border-purple-500",
    subPlatforms: [
      { id: "PWA", label: "PWAs", icon: Globe },
      { id: "Extension", label: "Extensions", icon: Sparkles },
      { id: "CloudApp", label: "Cloud Apps", icon: Globe },
    ],
  },
};