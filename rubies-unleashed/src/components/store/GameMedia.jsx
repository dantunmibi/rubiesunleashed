import { Gamepad2, ExternalLink, ImageIcon } from "lucide-react";

export default function GameMedia({ game }) {
  return (
    <>

      {/* ✅ PRIORITY 1: Playable Game Embed */}
{game.gameEmbed && (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-lg font-black text-white uppercase">
        <Gamepad2 size={20} className="text-ruby" /> Play in Browser
      </h3>
      <a 
        href={game.gameEmbed} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
      >
        Open Fullscreen <ExternalLink size={14} />
      </a>
    </div>
    
    {/* ✅ BEST: Responsive 16:9 with 650px max height */}
    <div className="relative w-full bg-black rounded-2xl overflow-hidden border-2 border-ruby/20 shadow-[0_0_30px_rgba(224,17,95,0.2)]">
      <div className="w-full aspect-video max-h-162.5 mx-auto">
        <iframe 
          src={game.gameEmbed} 
          className="w-full h-full" 
          allowFullScreen 
          title="Play Game"
          allow="autoplay; fullscreen; gamepad; microphone; camera"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-ruby via-pink-500 to-ruby" />
    </div>
  </section>
)}

      {/* ✅ PRIORITY 2: Gameplay Trailer (Shows Regardless of Embed) */}
      {game.video && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-500 uppercase tracking-widest">
            <ImageIcon size={16} /> {game.gameEmbed ? 'Gameplay Trailer' : 'Trailer'}
          </h3>
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe 
              src={game.video} 
              className="w-full h-full" 
              allowFullScreen 
              title="Trailer" 
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* Gallery */}
      {game.screenshots && game.screenshots.length > 0 && (
        <section className="space-y-6">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-500 uppercase tracking-widest">
            <ImageIcon size={16} /> Gallery
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {game.screenshots.map((shot, idx) => (
              <div key={idx} className="aspect-video bg-[#161b2c] rounded-lg overflow-hidden border border-white/5 hover:border-white/30 transition-all group cursor-pointer">
                <img src={shot} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" alt="Screenshot" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}