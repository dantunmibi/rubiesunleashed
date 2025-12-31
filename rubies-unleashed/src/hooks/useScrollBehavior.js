import { useState, useEffect } from "react";

export function useScrollBehavior() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToVault = () => {
    const vaultElement = document.getElementById("vault");
    if (vaultElement) {
      vaultElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return { showScrollTop, scrollToTop, scrollToVault };
}