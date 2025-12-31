import React from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton({ show, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40 p-4 bg-ruby text-white rounded-full shadow-lg shadow-ruby/40 border-2 border-white/10
        hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center
        ${show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}
      `}
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} strokeWidth={3} />
    </button>
  );
}