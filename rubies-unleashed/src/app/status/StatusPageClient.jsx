'use client';

import { useState, useEffect } from 'react';
import StatusHero from '@/components/status/StatusHero';
import ServiceGrid from '@/components/status/ServiceGrid';
import IncidentTimeline from '@/components/status/IncidentTimeline';
import UptimeStats from '@/components/status/UptimeStats';
import { useServiceStatus } from '@/hooks/useServiceStatus';
import incidentsData from '@/lib/status/incidents.json';
import { ArrowRight, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function StatusPageClient() {
  const { overall, services, checkedAt, isChecking, loading, refresh } =
    useServiceStatus(true, 60000);

  const [incidents] = useState(incidentsData.incidents || []);

  return (
    <main className="relative z-10">
      {/* Hero */}
      <StatusHero
        overall={overall}
        checkedAt={checkedAt}
        onRefresh={refresh}
        isChecking={isChecking || loading}
      />

      <div className="border-t border-white/5" />

      {/* Services Grid */}
      <div className="py-12">
        <ServiceGrid services={services} loading={loading} />
      </div>

      {/* Uptime Statistics */}
      <UptimeStats incidents={incidents} />

      <div className="border-t border-white/5" />

      {/* Incident History */}
      <IncidentTimeline incidents={incidents} />

      <div className="border-t border-white/5" />

      {/* Help CTA */}
      <section className="relative px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">

          {/* Help Center */}
          <div className="rounded-3xl border border-white/5 bg-surface/30 p-8">
            <h3 className="mb-4 flex items-center gap-2 font-black text-white text-2xl">
              <HelpCircle size={24} className="text-cyan-400" />
              Need Help?
            </h3>
            <p className="mb-6 font-medium text-slate-400 leading-relaxed">
              If you're experiencing issues not reflected here, our Help Center
              has troubleshooting guides and FAQs to get you back on track.
            </p>
            <Link
              href="/help"
              className="flex items-center gap-2 font-bold uppercase tracking-widest text-cyan-400 text-xs transition-colors hover:text-white"
            >
              Visit Help Center <ArrowRight size={14} />
            </Link>
          </div>

          {/* Contact Support */}
          <div className="rounded-3xl border border-white/5 bg-surface/30 p-8">
            <h3 className="mb-4 flex items-center gap-2 font-black text-white text-2xl">
              <Mail size={24} className="text-(--color-ruby)" />
              Contact Support
            </h3>
            <p className="mb-6 font-medium text-slate-400 leading-relaxed">
              Still stuck? Reach out directly for technical support, bug
              reports, or partnership inquiries. We're here to help.
            </p>
            <Link
              href="/contact"
              className="flex items-center gap-2 font-bold uppercase tracking-widest text-(--color-ruby) text-xs transition-colors hover:text-white"
            >
              Get in Touch <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}