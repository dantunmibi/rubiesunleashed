// page.js — Server Component (metadata + layout only)
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import StatusPageClient from './StatusPageClient';

export const metadata = {
  title: 'System Status | Rubies Unleashed',
  description:
    'Real-time health monitoring for all Rubies Unleashed services. Check platform status, response times, and incident history.',
};

export default function StatusPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-sans text-slate-200 selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />
      <StatusPageClient />
      <Footer />
    </div>
  );
}