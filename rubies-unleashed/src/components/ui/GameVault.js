// No 'use client' — server rendered, fully crawlable
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import GameCard from '@/components/store/GameCard';

export default function GameVault({ games = [] }) {
  // Slice server-side — no client fetch needed
  const featured = games.slice(0, 8);

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruby/10 border border-ruby/20 text-ruby font-black tracking-widest uppercase text-xs mb-3">
            <Sparkles size={12} /> New Arrivals
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            TREASURE VAULT
          </h2>
        </div>
        <Link
          href="/explore"
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          Enter The Vault{' '}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform text-ruby"
          />
        </Link>
      </div>

      {/* Game Grid — server rendered, crawlable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {featured.map((game, idx) => (
          <GameCard key={game.id || idx} game={game} />
        ))}
      </div>

      {/* Mobile View All — needs no JS, pure link */}
      <div className="mt-12 flex justify-center md:hidden">
        <Link
          href="/explore"
          className="w-full text-center px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
        >
          Enter The Vault
        </Link>
      </div>
    </section>
  );
}