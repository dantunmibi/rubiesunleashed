import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function GameSkeleton() {
  return (
    <div className="min-h-screen bg-background text-white font-sans">
      {/* 1. Navbar Placeholder (z-40 to match Rule 3A) */}
      <div className="h-20 w-full border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-40" />

      {/* 2. Hero Section Placeholder */}
      <div className="relative w-full h-125 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />

        {/* Hero Content Alignment */}
        <div className="absolute bottom-0 left-0 w-full p-8 pb-20 container mx-auto max-w-7xl px-6">
          {/* Breadcrumb/Label */}
          <Skeleton className="h-4 w-32 mb-6 bg-ruby/20" />

          {/* Title */}
          <Skeleton className="h-12 w-3/4 max-w-2xl mb-8" />

          {/* Metadata Row */}
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Skeleton className="h-14 w-44 rounded-xl" /> {/* Primary Action */}
            <Skeleton className="h-14 w-14 rounded-xl bg-white/5" />{" "}
            {/* Wishlist */}
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-20 relative z-10">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Media Carousel / Video */}
          <Skeleton className="w-full aspect-video rounded-2xl border border-white/10 bg-surface shadow-2xl" />

          {/* Description Block */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 mb-6" /> {/* Heading */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
            <Skeleton className="h-24 rounded-xl bg-surface border border-white/5" />
            <Skeleton className="h-24 rounded-xl bg-surface border border-white/5" />
            <Skeleton className="h-24 rounded-xl bg-surface border border-white/5" />
            <Skeleton className="h-24 rounded-xl bg-surface border border-white/5" />
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1">
          {/* Sticky Container (z-30) */}
          <div className="sticky top-24 space-y-6 z-30">
            {/* Info Card */}
            <div className="bg-surface p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-xl shrink-0" />{" "}
                {/* Icon */}
                <div className="space-y-3 flex-1 py-1">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-xl bg-ruby/20" />{" "}
              {/* Download CTA */}
              {/* Details List */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 opacity-50" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Cloud */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
