import React from "react";
import { Search, X } from "lucide-react";

export default function VaultHeader({ gameCount, searchQuery, onSearch }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          The Vault
        </h3>
        <p className="text-slate-400 text-xs md:text-sm">
          Browse {gameCount} curated titles.
        </p>
      </div>

      <div className="relative group w-full md:w-72">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-ruby transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder="Search titles, tags, or devs..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-surface/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-ruby transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}