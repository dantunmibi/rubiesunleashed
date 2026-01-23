import { Star, Cpu, Keyboard, Box, AlertTriangle, Lightbulb } from "lucide-react";
import { getGameTheme } from "@/lib/theme-utils"; // ✅ Modular Theme

export default function GameContent({ game }) {
  // --- 🎨 THEME ENGINE ---
  const theme = getGameTheme(game.type);

  // Existing Fallback Logic preserved
  const appKeywords = ['app', 'apps', 'tool', 'tools', 'software', 'pwa', 'saas'];
  const isApp = game.type === 'App' || 
                (game.tags && game.tags.some(t => appKeywords.includes(t.toLowerCase())));
                
  return (
  <section id="about-section" className="space-y-8">
    <div>
      {/* ✅ Content Notice Banner - Non-Mature Ratings Only */}
      {game.contentWarnings && game.contentWarnings.length > 0 &&(
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-5 rounded-lg mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-wider">
                Content Notice
              </h4>
              <div className="text-sm text-slate-300 leading-relaxed space-y-1">
                  {game.contentWarnings.map((line, i) => (
                  line.trim() && (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{line.trim()}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      <h3 className={`text-2xl font-black text-white mb-6 uppercase border-l-4 ${theme.border.replace('border-', 'border-')} pl-4`}>
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

      {game.features && game.features.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            {isApp ? <Box size={18} className={theme.text} /> : <Star size={18} className={theme.text} />} 
            Key Features
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${theme.bg} shrink-0`} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {game.requirements && game.requirements.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <Cpu size={18} className={theme.text} /> System Requirements
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ How It Works / How to Play */}
      {game.howItWorks && game.howItWorks.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <Lightbulb size={18} className={theme.text} /> 
            {isApp ? "How It Works" : "How to Play"}
          </h4>
          <ul className="space-y-3">
            {game.howItWorks
              .flatMap(step => {
                const sentences = step.split(/(?<=[.!?])\s+/);
                return sentences.filter(s => s.trim().length > 0);
              })
              .map((sentence, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bgLight} ${theme.text} font-bold text-xs shrink-0`}>
                    {i + 1}
                  </span>
                  {sentence.trim()}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Controls - Hide for Apps */}
      {!isApp && game.controls && game.controls.length > 0 && (
        <div className="bg-[#161b2c] p-6 rounded-2xl border border-white/5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <Keyboard size={18} className={theme.text} /> Controls
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.controls.map((ctrl, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                {ctrl}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}