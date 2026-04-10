// No 'use client' — server component
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/ui/Hero';
import FeatureTriangles from '@/components/ui/FeatureTriangles';
import AboutSection from '@/components/ui/AboutSection';
import GameVault from '@/components/ui/GameVault';
import Footer from '@/components/ui/Footer';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

export default function LandingPage({ games }) {
  return (
    <div className="min-h-screen bg-background text-slate-200 overflow-x-hidden relative font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />
      <Hero />
      <FeatureTriangles />
      <AboutSection />
      {/* Games flow from server: page.js → HomeWrapper → LandingPage → GameVault */}
      <GameVault games={games} />
      <Footer />
    </div>
  );
}