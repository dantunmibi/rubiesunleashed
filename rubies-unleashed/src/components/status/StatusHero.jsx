/**
 * STATUS HERO - CINEMATIC VERSION
 * Matches brand aesthetic from About page
 * Large dramatic spacing, glow effects, story-driven
 */

'use client';

import { CheckCircle2, AlertTriangle, XCircle, Wrench, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG = {
  operational: {
    icon: CheckCircle2,
    label: 'All Systems Operational',
    subtitle: 'Platform running smoothly',
    color: 'emerald',
    glowColor: 'emerald-500'
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Degraded Performance',
    subtitle: 'Some services experiencing issues',
    color: 'amber',
    glowColor: 'amber-500'
  },
  outage: {
    icon: XCircle,
    label: 'Service Disruption',
    subtitle: "We're working to resolve this",
    color: 'ruby',
    glowColor: 'rose-500'
  },
  maintenance: {
    icon: Wrench,
    label: 'Scheduled Maintenance',
    subtitle: 'Temporary service interruption',
    color: 'slate',
    glowColor: 'slate-500'
  }
};

export default function StatusHero({ overall, checkedAt, onRefresh, isChecking }) {
  const config = STATUS_CONFIG[overall] || STATUS_CONFIG.operational;
  const Icon = config.icon;

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-40 text-center lg:px-8">
      {/* Background Glow (Matching About page style) */}
      <div className={`pointer-events-none absolute left-1/2 top-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-${config.glowColor}/10 blur-[120px]`} />
      
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Badge Label (Like "Our Purpose") */}
        <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8 inline-flex items-center gap-2 rounded-full border border-${config.color}-500/30 bg-${config.color}-500/10 px-4 py-2 font-bold uppercase tracking-wider text-${config.color}-400 text-sm`}>
          <Icon size={14} />
          <span>Live Status</span>
        </div>
        
        {/* Main Heading (Dramatic Typography) */}
        <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 mb-6 font-black uppercase tracking-tight text-white text-5xl leading-tight md:text-7xl lg:text-8xl">
          {overall === 'operational' && (
            <>
              ALL SYSTEMS <br />
              <span className="bg-linear-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                OPERATIONAL
              </span>
            </>
          )}
          {overall === 'degraded' && (
            <>
              DEGRADED <br />
              <span className="bg-linear-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
                PERFORMANCE
              </span>
            </>
          )}
          {overall === 'outage' && (
            <>
              SERVICE <br />
              <span className="bg-linear-to-r from-ruby to-rose-500 bg-clip-text text-transparent">
                DISRUPTION
              </span>
            </>
          )}
          {overall === 'maintenance' && (
            <>
              SCHEDULED <br />
              <span className="bg-linear-to-r from-slate-500 to-slate-400 bg-clip-text text-transparent">
                MAINTENANCE
              </span>
            </>
          )}
        </h1>
        
        {/* Subtitle */}
        <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mx-auto mb-12 max-w-2xl font-medium text-slate-400 text-xl leading-relaxed md:text-2xl">
          {config.subtitle}
          {checkedAt && (
            <>
              <br />
              <span className="text-base text-slate-500">
                Last verified {formatDistanceToNow(checkedAt, { addSuffix: true })}
              </span>
            </>
          )}
        </p>

        {/* Refresh Button (Styled like CTA) */}
        <button
          onClick={onRefresh}
          disabled={isChecking}
          className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-8 py-4 font-bold uppercase tracking-widest text-white text-sm transition-all hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 transition-transform ${isChecking ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          {isChecking ? 'Checking Systems...' : 'Refresh Status'}
        </button>
      </div>
    </section>
  );
}