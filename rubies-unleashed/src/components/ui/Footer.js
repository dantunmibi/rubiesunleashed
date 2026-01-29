/**
 * ================================================================
 * FOOTER COMPONENT
 * ================================================================
 *
 * Purpose:
 * - 4-Column Professional Layout
 * - Brand Style: "Treasure Hunter" theme (Map, Guild, Codex)
 * - Scope: Universal Marketplace (Games, Apps, Tools)
 * - Includes: Help Center, Socials, Legacy Link
 * ================================================================
 */

import React from "react";
import Link from "next/link";
import SocialLinks from './SocialLinks';
import {
  ArrowRight,
  Map,
  Shield,
  Scroll,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background pt-24 pb-12 px-6 lg:px-8 border-t border-white/5 text-sm">
      <div className="max-w-7xl mx-auto">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Legacy */}
          <div className="space-y-6">
            <h4 className="font-black text-2xl text-white">RUBIES UNLEASHED</h4>
            <p className="text-slate-400 text-base leading-relaxed">
              Where rising{" "}
              <span className="text-white font-bold">
                games, apps, and tools
              </span>{" "}
              become LEGENDARY! 💎
            </p>

            <p className="text-slate-500 text-sm leading-relaxed">
              <strong className="text-white">Est. 2020</strong> — Evolved from RubyApks, 
              now empowering indie creators with The Forge publishing platform.
            </p>

            <div className="pt-2">
              <SocialLinks variant="minimal" color="text-slate-400 hover:text-ruby" />
            </div>
          </div>

          {/* Column 2: Treasure Map (Discovery) */}
          <div>
            <h5 className="font-black text-white text-lg mb-6 flex items-center gap-2">
              <Map size={20} className="text-ruby" /> Treasure Map
            </h5>
            <ul className="space-y-4 font-medium text-slate-400">
              <li>
                <Link
                  href="/explore"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>🗺️</span> The Vault
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?q=Games"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>🎮</span> Indie Games
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?q=Apps"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>📱</span> Apps & Tools
                </Link>
              </li>
              <li>
                <a
                  href="/publish"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>📜</span> Start Publishing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Guild Hall (Support) */}
          <div>
            <h5 className="font-black text-white text-lg mb-6 flex items-center gap-2">
              <Shield size={20} className="text-ruby" /> Guild Hall
            </h5>
            <ul className="space-y-4 font-medium text-slate-400">
              <li>
                <Link
                  href="/help"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>❓</span> Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>📬</span> Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/publish"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>⚔️</span> Developers
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>🟢</span> System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: The Codex (Legal/Info) */}
          <div>
            <h5 className="font-black text-white text-lg mb-6 flex items-center gap-2">
              <Scroll size={20} className="text-ruby" /> The Codex
            </h5>
            <ul className="space-y-4 font-medium text-slate-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>🛡️</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>📖</span> Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-ruby-light transition-colors flex items-center gap-3"
                >
                  <span>💎</span> About Rubies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 text-center text-slate-600 font-bold flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {currentYear} Rubies Unleashed ⚡ Successor of RubyApks</p>
          <p>💎 All Treasures Reserved</p>
        </div>
      </div>
    </footer>
  );
}
