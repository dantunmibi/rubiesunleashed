"use client";

import { useState, useEffect } from "react";
import { Gamepad2, AppWindow, ExternalLink, ImageIcon, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getGameTheme } from "@/lib/theme-utils";

export default function GameMedia({ game }) {
  const theme = getGameTheme(game.type);
  const isApp = game.type === 'App';
  
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const screenshots = Array.isArray(game?.screenshots) ? game.screenshots : [];

  const convertToEmbedUrl = (url) => {
    if (!url) return url;
    
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  const isEmbed = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('youtube') || 
           lower.includes('youtu.be') || 
           lower.includes('vimeo') || 
           lower.includes('dailymotion') || 
           lower.includes('twitch') ||
           lower.includes('itch.io/embed') ||
           lower.includes('blogger.com/video');
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <>
      {/* Playable Embed */}
      {(game.gameEmbed || game.html5_embed_url) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black text-white uppercase">
              {isApp ? <AppWindow size={20} className={theme.text} /> : <Gamepad2 size={20} className={theme.text} />}
              {isApp ? 'Try in Browser' : 'Play in Browser'}
            </h3>
            <a 
              href={game.gameEmbed || game.html5_embed_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Open Fullscreen <ExternalLink size={14} />
            </a>
          </div>
          
          <div className={`relative w-full bg-black rounded-2xl overflow-hidden border-2 ${theme.border.replace('border-', 'border-')}/20 shadow-[0_0_30px_${isApp ? 'rgba(6,182,212,0.2)' : 'rgba(224,17,95,0.2)'}]`}>
            <div className="w-full aspect-video max-h-162.5 mx-auto">
              <iframe 
                src={game.gameEmbed || game.html5_embed_url} 
                className="w-full h-full" 
                allowFullScreen 
                title={isApp ? 'Try App' : 'Play Game'}
                allow="autoplay; fullscreen; gamepad; microphone; camera"
              />
            </div>
            <div className={`absolute top-0 left-0 w-full h-1 ${isApp ? 'bg-linear-to-r from-netrunner via-cyan-400 to-netrunner' : 'bg-linear-to-r from-ruby via-pink-500 to-ruby'}`} />
          </div>
        </section>
      )}

      {/* Video */}
      {(game.video || game.videoUrl) && (
        <section id="video-section" className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-500 uppercase tracking-widest">
            <Play size={16} /> {game.gameEmbed ? 'Gameplay Trailer' : 'Trailer'}
          </h3>
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
            
            {(() => {
              const videoUrl = game.video || game.videoUrl;
              const embedUrl = convertToEmbedUrl(videoUrl);
              
              return isEmbed(embedUrl) ? (
                <iframe 
                  src={embedUrl} 
                  className="w-full h-full" 
                  allowFullScreen 
                  title="Trailer" 
                  loading="lazy"
                />
              ) : (
                <video 
                    controls 
                    preload="metadata"
                    className="w-full h-full object-contain"
                    poster={game.image}
                >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    Your browser does not support the video tag.
                </video>
              );
            })()}

          </div>
        </section>
      )}

      {/* Gallery */}
      {screenshots.length > 0 && (
        <section id="screenshots-section" className="space-y-6">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-500 uppercase tracking-widest">
            <ImageIcon size={16} /> Gallery
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {screenshots.map((shot, idx) => (
              <div 
                key={idx} 
                onClick={() => openLightbox(idx)}
                className={`aspect-video bg-[#161b2c] rounded-lg overflow-hidden border border-white/5 hover:border-${isApp ? 'netrunner' : 'ruby'}/50 transition-all group cursor-pointer relative`}
              >
                <img 
                  src={shot} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                  referrerPolicy="no-referrer" 
                  alt={`Screenshot ${idx + 1}`} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-6 cursor-pointer right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <X size={32} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-20" onClick={(e) => e.stopPropagation()}>
            
            <button 
                onClick={prevImage}
                className={`absolute cursor-pointer left-2 md:left-8 p-3 text-white/50 hover:text-${isApp ? 'netrunner' : 'ruby'} hover:bg-black/50 rounded-full transition-all hover:scale-110 z-40`}
            >
                <ChevronLeft size={48} />
            </button>

            <img 
                src={screenshots[lightboxIndex]} 
                alt="Full View" 
                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-300"
                referrerPolicy="no-referrer"
            />

            <button 
                onClick={nextImage}
                className={`absolute cursor-pointer right-2 md:right-8 p-3 text-white/50 hover:text-${isApp ? 'netrunner' : 'ruby'} hover:bg-black/50 rounded-full transition-all hover:scale-110 z-40`}
            >
                <ChevronRight size={48} />
            </button>
          </div>

          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-[90vw] p-2 no-scrollbar" 
            onClick={(e) => e.stopPropagation()}
          >
            {screenshots.map((shot, idx) => (
                <button 
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-16 h-10 shrink-0 rounded-sm overflow-hidden border transition-all duration-300 ${
                        idx === lightboxIndex 
                        ? `border-${isApp ? 'netrunner' : 'ruby'} scale-110 ring-2 ring-${isApp ? 'netrunner' : 'ruby'}/30 opacity-100` 
                        : 'border-white/10 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
                    }`}
                >
                    <img src={shot} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}