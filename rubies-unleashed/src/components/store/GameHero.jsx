import Link from "next/link";
import { ArrowLeft, Download, Gamepad2, Heart, Box } from "lucide-react";
import { getDownloadIcon } from "@/lib/game-utils";

export default function GameHero({ game, isWishlisted, toggleWishlist }) {
  const isApp = game.type === 'App' || game.tags?.some(t => ['App', 'Apps', 'Tool', 'Software'].includes(t));
  const hasMultipleBuilds = game.downloadLinks && game.downloadLinks.length > 1;
  const hasValidDownload = (game.downloadLinks && game.downloadLinks.length > 0) || (game.downloadUrl && game.downloadUrl !== "#");
  const playButtonLink = game.downloadLinks && game.downloadLinks.length > 0 ? game.downloadLinks[0].url : "#";

  return (
    <div className="relative md:h-[75vh] h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center scale-105 blur-md md:opacity-40 z-0" style={{ backgroundImage: `url(${game.image})` }} />
      <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent z-10" />

      <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-6 pb-12 pt-54 flex flex-col md:flex-row items-end gap-8 z-20 h-full justify-end">
        <div className="hidden md:block w-56 h-80 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-10 -mb-16 bg-[#161b2c] group shrink-0">
          <img src={game.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={game.title} />
        </div>

        <div className="flex-1 mb-2">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/explore" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft size={16} /> Back
            </Link>
            <span className="h-1 w-1 rounded-full bg-slate-700"></span>
            <span className="text-ruby font-bold uppercase tracking-widest text-[10px] bg-ruby/10 px-2 py-0.5 rounded border border-ruby/20">
              {game.tag}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] max-w-3xl">
            {game.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            {hasMultipleBuilds ? (
              <div className="flex flex-wrap gap-3">
                {game.downloadLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-ruby hover:bg-[#c00e50] text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all hover:-translate-y-1 shadow-lg">
                    {getDownloadIcon(link.platform)} {link.platform}
                  </a>
                ))}
              </div>
            ) : hasValidDownload ? (
              <a href={playButtonLink} target="_blank" rel="noopener noreferrer" className="bg-ruby hover:bg-[#c00e50] text-white pl-6 pr-8 py-3.5 rounded-xl font-black uppercase tracking-wide flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(224,17,95,0.4)]">
                {/* ✅ ICON SWAP */}
                {isApp ? <Box size={24} strokeWidth={2.5} /> : <Gamepad2 size={24} strokeWidth={2.5} />}
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] opacity-80 uppercase tracking-widest">Instant Access</span>
                  {/* ✅ TEXT SWAP */}
                  <span>{isApp ? "Get App" : "Play Now"}</span>
                </div>
              </a>
            ) : (
              <div className="bg-slate-700 text-slate-400 pl-6 pr-8 py-3.5 rounded-xl font-black uppercase tracking-wide flex items-center gap-3 cursor-not-allowed">
                <Download size={24} strokeWidth={2.5} />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] opacity-80 uppercase tracking-widest">Unavailable</span>
                  <span>No Link Found</span>
                </div>
              </div>
            )}

            <button onClick={toggleWishlist} className={`px-5 py-3.5 rounded-xl border-2 font-bold flex items-center gap-2 transition-all ${isWishlisted ? "bg-white text-ruby border-white shadow-lg" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white"}`}>
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}