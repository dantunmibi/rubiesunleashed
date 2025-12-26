import React from "react";

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Top Left Blob: 1000px x 600px */}
      <div className="absolute top-0 left-0 w-250 h-150 bg-ruby-dark/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Bottom Right Blob: 800px x 600px */}
      <div className="absolute bottom-0 right-0 w-200 h-150 bg-slate-800/20 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2"></div>
    </div>
  );
}