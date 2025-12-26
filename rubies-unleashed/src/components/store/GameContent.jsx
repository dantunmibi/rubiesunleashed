import { Star, Cpu, Keyboard, Box, Gamepad2, AlertTriangle } from "lucide-react";

export default function GameContent({ game }) {
  // ROBUST CHECK: Handle plural/singular and case
  const appKeywords = ['app', 'apps', 'tool', 'tools', 'software', 'pwa', 'saas'];
  
  const isApp = game.type === 'App' || 
                (game.tags && game.tags.some(t => appKeywords.includes(t.toLowerCase())));
                
  return (
    <section id="about-section" className="space-y-8">
      <div>
        {/* Dynamic Header */}
        <h3 className="text-2xl font-black text-white mb-6 uppercase border-l-4 border-ruby pl-4">
            {isApp ? "About The Software" : "About The Game"}
        </h3>
        
<div className="prose prose-invert prose-lg max-w-none text-slate-300 mb-8">
  {game.fullDescription ? (
    game.fullDescription.split("\n\n").map((paragraph, idx) => (
      paragraph.trim() ? (
        <p key={idx} className="mb-6 leading-relaxed">{paragraph}</p>
      ) : null
    ))
  ) : (
    <p>No description available.</p>
  )}
</div>
      </div>

{/* ✅ NEW: Content Warnings Section */}
{game.contentWarnings && game.contentWarnings.length > 0 && (
  <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-2xl">
    <h4 className="flex items-center gap-2 text-lg font-bold text-red-400 mb-4">
      <AlertTriangle size={18} /> Content Warning
    </h4>
    <ul className="list-disc list-inside space-y-1 text-sm text-red-200/80">
      {game.contentWarnings.map((warning, i) => (
        <li key={i}>{warning}</li>
      ))}
    </ul>
  </div>
)}

      {game.features && game.features.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
        <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            {isApp ? <Box size={18} className="text-ruby" /> : <Star size={18} className="text-ruby" />} 
            Key Features
        </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.features.map((feature, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ruby shrink-0" />{feature}</li>)}
          </ul>
        </div>
      )}

      {game.requirements && game.requirements.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Cpu size={18} className="text-ruby" /> System Requirements</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.requirements.map((req, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />{req}</li>)}
          </ul>
        </div>
      )}

      {/* Hide Controls for Apps */}
      {!isApp && game.controls && game.controls.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Keyboard size={18} className="text-ruby" /> Controls</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.controls.map((ctrl, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0" />{ctrl}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}