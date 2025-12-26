  import { Gamepad2, Box } from "lucide-react";
  import { getDownloadIcon } from "@/lib/game-utils";

  export default function DownloadCallout({ game }) {
    const isApp = game.type === 'App' || game.tags?.some(t => ['App', 'Apps', 'Tool'].includes(t));
    const hasMultipleBuilds = game.downloadLinks && game.downloadLinks.length > 1;
    const hasValidDownload = (game.downloadLinks && game.downloadLinks.length > 0) || (game.downloadUrl && game.downloadUrl !== "#");
    const playButtonLink = game.downloadLinks && game.downloadLinks.length > 0 ? game.downloadLinks[0].url : "#";

    return (
      <section id="download-section" className="bg-[#161b2c] border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 scroll-mt-32">
        <div>
          <h4 className="text-xl font-bold text-white mb-1">Ready to dive in?</h4>
          <p className="text-slate-400 text-sm">Safe, secure, and direct download via external providers.</p>
        </div>

        {hasMultipleBuilds ? (
          <div className="flex flex-wrap gap-3">
            {game.downloadLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-ruby hover:bg-[#c00e50] text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all hover:-translate-y-1 shadow-lg">
                {getDownloadIcon(link.platform)} {link.platform}
              </a>
            ))}
          </div>
        ) : hasValidDownload ? (
          <a href={playButtonLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto bg-ruby hover:bg-[#c00e50] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_20px_rgba(224,17,95,0.3)]">
            {/* ✅ ICON & TEXT SWAP */}
            {isApp ? <Box size={20} /> : <Gamepad2 size={20} />}
            {isApp ? "Get App" : "Play Now"}
          </a>
        ) : (
          <button disabled className="w-full md:w-auto bg-slate-700 text-slate-400 px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed">
            Unavailable
          </button>
        )}
      </section>
    );
  }