import React from "react";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link"; // Use Next.js Link for internal routing
import GiantRuby from "./GiantRuby";

export default function Hero() {
  return (
    <section className="relative md:pt-10 pt-30 pb-20 overflow-hidden min-h-[85vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="space-y-8 relative z-10 text-center lg:text-left order-2 lg:order-1">
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
            UNLEASH <br /> 
            <span className="text-transparent px-1 bg-clip-text bg-linear-to-r from-ruby to-rose-500 drop-shadow-[0_0_30px_rgba(224,17,95,0.4)]">
              HIDDEN GEMS
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed mx-auto lg:mx-0 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
            Discover the next big indie hit, support rising developers, and fill your vault with Rubies. A marketplace built for the community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
            <Link href="/explore" className="group relative bg-ruby hover:bg-ruby-light text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(224,17,95,0.4)] shadow-[0_4px_0_var(--color-ruby-dark)] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2">
              Explore Vault <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/publish" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              Start Publishing
            </Link>
          </div>
        </div>
        
        {/* Right Visual (Your 3D Component) */}
        <div className="relative mt-5 md:mt-0 mb-10 md:mb-0 order-1 lg:order-2 h-100 lg:h-150 flex items-center justify-center">
           {/* Add a glow behind your 3D element */}
           <div className="absolute inset-0 bg-ruby/10 blur-[100px] rounded-full" />
           <GiantRuby />
        </div>

      </div>
    </section>
  );
}