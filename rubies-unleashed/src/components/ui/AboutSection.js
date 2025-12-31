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

            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-tight">
              A Marketplace for <br /> Rising Creations
            </h2>

            <div className="space-y-6 text-slate-400 text-lg leading-relaxed font-medium">
              <p>
                <span className="text-ruby font-bold">Rubies Unleashed</span> is a curated marketplace for indie creators,
                from games and apps to experimental tools and digital experiences.
              </p>

              <p>
                Born as the successor to <span className="text-ruby font-bold">RubyApks</span>, our goal is to spotlight
                meaningful creations that deserve attention, not algorithms.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="bg-background p-8 rounded-2xl border border-slate-800 hover:border-ruby/50 transition-colors shadow-lg">
              <h3 className="font-bold text-xl text-white mb-3 flex items-center gap-3">
                🧩 Indie-First Marketplace
              </h3>
              <p className="text-slate-400">
                A home for games, apps, and digital projects built by independent creators of all sizes.
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border border-slate-800 hover:border-ruby/50 transition-colors shadow-lg">
              <h3 className="font-bold text-xl text-white mb-3 flex items-center gap-3">
                🔍 Discovery Over Hype
              </h3>
              <p className="text-slate-400">
                We focus on quality, creativity, and potential, not trends, ads, or pay-to-win visibility.
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border border-slate-800 hover:border-ruby/50 transition-colors shadow-lg">
              <h3 className="font-bold text-xl text-white mb-3 flex items-center gap-3">
                🌱 Built With the Community
              </h3>
              <p className="text-slate-400">
                Rubies Unleashed grows alongside its creators and users, shaped by feedback and shared passion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
