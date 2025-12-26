"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Vault", href: "/explore" },
    { name: "About", href: "/#about" },
    { name: "Publish", href: "https://forms.gle/i7X2sUJ5cnqsUciA6", target: "_blank" },
  ];

  return (
    <>
      {/* 
        NAVBAR CONTAINER 
        - 'absolute': Overlays the Hero image but scrolls away.
        - 'h-24': Taller to accommodate the bigger logo comfortably.
        - 'bg-gradient-to-b': Subtle fade from black at the top for readability.
      */}
      <nav className="absolute top-0 left-0 right-0 z-50 h-24 w-full border-none from-black/60 to-transparent">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
          {/* 1. LOGO (Left - Contained & Centered) */}
          <Link href="/" className="flex items-center gap-1 group z-50 h-full">
            {/* Logo Container - Flex centered */}
            <div className="flex items-center justify-center h-full">
              <img
                src="/ru-logo.png"
                alt="Rubies Unleashed"
                // Size: h-20 (80px) | Fit: Contain
                className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(224,17,95,0.6)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Text Container - Flex centered vertically */}
            <div className="hidden md:flex flex-col justify-center h-full pt-1">
              <h1 className="font-black text-2xl leading-none tracking-tighter text-white drop-shadow-md">
                RUBIES
              </h1>
              <span className="font-bold text-[10px] tracking-[0.25em] text-ruby uppercase leading-none mt-1.5 pl-0.5">
                UNLEASHED
              </span>
            </div>
          </Link>

          {/* 2. DESKTOP LINKS (Centered) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors relative py-2 group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ruby transition-all duration-300 group-hover:w-full box-shadow-[0_0_10px_#E0115F]" />
              </Link>
            ))}
          </div>

          {/* 3. ACTIONS (Right) */}
          <div className="flex items-center gap-6 z-50">
            <Link
              href="/login"
              className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="hidden md:block bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-ruby hover:text-white transition-all shadow-lg hover:shadow-ruby/50 active:scale-95"
            >
              Join
            </Link>

            {/* Mobile Menu Button (Bigger Hit Area) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white hover:text-ruby transition-colors p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU (Beautiful Overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-[#0b0f19] transition-all duration-500 md:hidden flex flex-col items-center justify-center ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-ruby/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col gap-8 text-center relative z-10">
          {navLinks.map((item, idx) => (
            <Link
              key={item.name}
              href={item.href}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: `${idx * 75}ms` }}
              className={`text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-slate-500 uppercase tracking-tighter hover:to-ruby transition-all transform ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="w-24 h-1 bg-white/10 rounded-full my-8 relative z-10" />

        <div
          className={`flex flex-col gap-4 w-full max-w-xs relative z-10 transition-all duration-700 delay-300 ${
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="w-full bg-ruby text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(224,17,95,0.4)] active:scale-95 transition-all text-center"
          >
            Join The Vault
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors text-center"
          >
            Member Login
          </Link>
        </div>
      </div>
    </>
  );
}
