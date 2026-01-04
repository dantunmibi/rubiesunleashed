/**
 * UPTIME STATS - CINEMATIC LAYOUT
 * Matches "Rubies Economy" section style
 * Dark card with glow effects and dramatic presentation
 */

'use client';

import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { BarChart3, TrendingUp } from 'lucide-react';

function UptimeBar({ percentage, label, period }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 transition-all hover:border-ruby/30">
      {/* Glow Effect */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-[80px]" />
      
      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 font-bold uppercase tracking-widest text-slate-400 text-xs">
              {label}
            </p>
            <p className="font-black text-white text-4xl md:text-5xl">{percentage}%</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <p className="mt-3 text-slate-500 text-sm">{period}</p>
      </div>
    </div>
  );
}

function UptimeCalendar({ incidents, days = 90 }) {
  const dailyStatus = useMemo(() => {
    const statusMap = {};
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const key = format(date, 'yyyy-MM-dd');
      statusMap[key] = { status: 'operational', incidents: [] };
    }

    incidents.forEach(incident => {
      const start = new Date(incident.startTime);
      const end = incident.endTime ? new Date(incident.endTime) : new Date();
      
      let current = start;
      while (current <= end && current <= today) {
        const key = format(current, 'yyyy-MM-dd');
        if (statusMap[key]) {
          const currentStatus = statusMap[key].status;
          const newStatus = incident.severity === 'critical' ? 'outage' :
                           incident.severity === 'major' ? 'degraded' :
                           incident.severity === 'maintenance' ? 'maintenance' :
                           currentStatus;
          
          if (getSeverityLevel(newStatus) > getSeverityLevel(currentStatus)) {
            statusMap[key].status = newStatus;
          }
          statusMap[key].incidents.push(incident);
        }
        current = new Date(current.setDate(current.getDate() + 1));
      }
    });

    return statusMap;
  }, [incidents, days]);

  function getSeverityLevel(status) {
    const levels = { operational: 0, maintenance: 1, degraded: 2, outage: 3 };
    return levels[status] || 0;
  }

  const statusColors = {
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    outage: 'bg-ruby',
    maintenance: 'bg-slate-500'
  };

  const dayBlocks = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const key = format(date, 'yyyy-MM-dd');
    const dayData = dailyStatus[key] || { status: 'operational', incidents: [] };
    
    dayBlocks.push(
      <div
        key={key}
        className="group relative"
      >
        <div className={`h-8 w-2 rounded-sm ${statusColors[dayData.status]} transition-all group-hover:scale-110 group-hover:shadow-[0_0_10px_currentColor]`} />
        
        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-surface px-3 py-2 shadow-lg group-hover:block text-xs">
          <div className="font-bold">{format(date, 'MMM d')}</div>
          <div className="mt-1 capitalize text-slate-400">{dayData.status}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-surface/30 p-8">
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-cyan-400" />
        <h3 className="font-black uppercase tracking-wide text-white text-xl">
          {days}-Day History
        </h3>
      </div>
      
      <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
        {dayBlocks}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-white/5 pt-6 text-xs">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-sm ${color}`} />
            <span className="font-medium capitalize text-slate-400">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UptimeStats({ incidents = [] }) {
  return (
    <section className="relative border-t border-white/5 bg-surface/20 px-6 py-24">
      {/* Background Glow (Like Rubies Economy section) */}
      <div className="pointer-events-none absolute right-0 top-0 h-125 w-125 rounded-full bg-emerald-500/5 blur-[100px]" />
      
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/20">
            <BarChart3 size={32} className="text-emerald-400" />
          </div>
          <h2 className="mb-4 font-black text-white text-3xl md:text-5xl">
            Reliability Metrics
          </h2>
          <p className="mx-auto max-w-2xl text-slate-300 text-lg">
            Our commitment to uptime, measured and verified continuously
          </p>
        </div>

        {/* Uptime Bars */}
        <div className="mb-12 grid gap-8 md:grid-cols-2">
          <UptimeBar percentage="99.98" label="Last 30 Days" period="Rolling monthly average" />
          <UptimeBar percentage="99.95" label="Last 90 Days" period="Quarterly performance" />
        </div>

        {/* Calendar */}
        <UptimeCalendar incidents={incidents} days={90} />
      </div>
    </section>
  );
}