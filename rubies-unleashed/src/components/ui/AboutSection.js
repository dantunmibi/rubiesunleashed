import React from "react";
import { Gem } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 lg:px-8 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
              <div className="inline-block p-4 rounded-2xl bg-surface border border-slate-700 shadow-xl mb-8 transform -rotate-3">
                  <Gem size={48} className="text-ruby" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-tight">More Than Just <br/> A Marketplace</h2>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed font-medium">
                  <p>We unearth the hidden gems in indies and launch them to legendary status. Born from <span className="text-ruby font-bold">RubyApks</span>, we've evolved into a complete ecosystem.</p>
              </div>
          </div>
          
          <div className="grid gap-6">
              <div className="bg-background p-8 rounded-2xl border border-slate-800 hover:border-ruby/50 transition-colors shadow-lg">
                  <h3 className="font-bold text-xl text-white mb-3 flex items-center gap-3">📜 Publishing Guild</h3>
                  <p className="text-slate-400">We select high-potential games and provide official publishing support to help them scale globally.</p>
              </div>
              <div className="bg-background p-8 rounded-2xl border border-slate-800 hover:border-ruby/50 transition-colors shadow-lg">
                  <h3 className="font-bold text-xl text-white mb-3 flex items-center gap-3">💰 Ruby Economy</h3>
                  <p className="text-slate-400">A flexible currency system. Earn by playing, buy via gift cards, or trade within the marketplace.</p>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}