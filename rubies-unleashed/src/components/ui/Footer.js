import React from "react";
import { ArrowRight, Map, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background pt-24 pb-12 px-6 lg:px-8 border-t border-white/5 text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <h4 className="font-black text-2xl text-white mb-6">RUBIES UNLEASHED</h4>
            <p className="text-slate-400 text-lg mb-8 max-w-sm leading-relaxed">
              Where rising games become LEGENDARY! Built by treasure hunters, for treasure hunters. 💎
            </p>
            <a 
              href="https://rubyapks.blogspot.com" 
              target="_blank" 
              className="inline-flex items-center gap-2 px-5 py-3 bg-surface border border-slate-800 hover:border-ruby text-white font-bold rounded-lg transition-all group"
            >
              Visit RubyApks <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div>
            <h5 className="font-black text-white text-lg mb-6 flex items-center gap-2">
              <Map size={20} className="text-ruby" /> Treasure Map
            </h5>
            <ul className="space-y-4 font-medium text-slate-400">
              <li><a href="/explore" className="hover:text-ruby-light transition-colors flex items-center gap-3">🗺️ Marketplace</a></li>
              <li><a href="https://forms.gle/i7X2sUJ5cnqsUciA6" className="hover:text-ruby-light transition-colors flex items-center gap-3">📜 Publishing</a></li>
              <li><a href="#" className="hover:text-ruby-light transition-colors flex items-center gap-3">🏆 Competitions</a></li>
              <li><a href="#" className="hover:text-ruby-light transition-colors flex items-center gap-3">💰 Earn Rubies</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-white text-lg mb-6 flex items-center gap-2">
              <Shield size={20} className="text-ruby" /> Guild Hall
            </h5>
            <ul className="space-y-4 font-medium text-slate-400">
              <li><a href="/developers" className="hover:text-ruby-light transition-colors flex items-center gap-3">⚔️ Developers</a></li>
              <li><a href="/contact" className="hover:text-ruby-light transition-colors flex items-center gap-3">📬 Contact</a></li>
              <li><a href="/privacy" className="hover:text-ruby-light transition-colors flex items-center gap-3">🛡️ Privacy</a></li>
              <li><a href="/terms" className="hover:text-ruby-light transition-colors flex items-center gap-3">📖 Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-slate-600 font-bold flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Rubies Unleashed ⚡ Successor of RubyApks</p>
          <p>💎 All Treasures Reserved</p>
        </div>
      </div>
    </footer>
  );
}