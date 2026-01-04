/**
 * INCIDENT TIMELINE - STORY FORMAT
 * Matches narrative-driven approach from About page
 * Clean, readable timeline with dramatic emphasis
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronDown, ChevronUp, 
  AlertTriangle, XCircle, Wrench, Info,
  CheckCircle2
} from 'lucide-react';

const SEVERITY_CONFIG = {
  minor: {
    icon: Info,
    color: 'blue',
    label: 'Minor',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400'
  },
  major: {
    icon: AlertTriangle,
    color: 'amber',
    label: 'Major',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400'
  },
  critical: {
    icon: XCircle,
    color: 'ruby',
    label: 'Critical',
    bg: 'bg-ruby/10',
    border: 'border-ruby/30',
    text: 'text-ruby'
  },
  maintenance: {
    icon: Wrench,
    color: 'slate',
    label: 'Maintenance',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400'
  }
};

const UPDATE_STATUS_CONFIG = {
  investigating: { label: 'Investigating', color: 'amber' },
  identified: { label: 'Identified', color: 'blue' },
  monitoring: { label: 'Monitoring', color: 'cyan' },
  resolved: { label: 'Resolved', color: 'emerald' },
  maintenance: { label: 'In Progress', color: 'slate' },
  completed: { label: 'Completed', color: 'emerald' }
};

function IncidentCard({ incident }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severityConfig = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.minor;
  const SeverityIcon = severityConfig.icon;

  const duration = incident.endTime
    ? Math.round((new Date(incident.endTime) - new Date(incident.startTime)) / 1000 / 60)
    : null;

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/5 bg-surface/30 transition-all hover:border-ruby/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-8 text-left transition-all hover:bg-white/5"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3 className="font-black text-white text-xl">{incident.title}</h3>
              <span className={`inline-flex items-center gap-2 rounded-full ${severityConfig.bg} ${severityConfig.border} border px-3 py-1.5`}>
                <SeverityIcon className={`h-3.5 w-3.5 ${severityConfig.text}`} />
                <span className={`font-bold uppercase tracking-widest ${severityConfig.text} text-xs`}>
                  {severityConfig.label}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
              <span>{format(new Date(incident.startTime), 'MMMM d, yyyy · h:mm a')}</span>
              {duration && (
                <>
                  <span>•</span>
                  <span className="font-medium">{duration} minutes</span>
                </>
              )}
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp className="h-6 w-6 shrink-0 text-slate-400 transition-transform group-hover:text-ruby" />
          ) : (
            <ChevronDown className="h-6 w-6 shrink-0 text-slate-400 transition-transform group-hover:text-ruby" />
          )}
        </div>
      </button>

      {/* Expanded Timeline */}
      {isExpanded && (
        <div className="border-t border-white/5 p-8">
          <div className="space-y-6">
            {incident.updates?.map((update, index) => {
              const updateConfig = UPDATE_STATUS_CONFIG[update.status] || UPDATE_STATUS_CONFIG.investigating;
              const isLast = index === incident.updates.length - 1;

              return (
                <div key={index} className="relative pl-10">
                  {!isLast && (
                    <div className="absolute bottom-0 left-2.5 top-10 w-px bg-white/10" />
                  )}

                  <div className={`absolute left-0 top-2 h-5 w-5 rounded-full border-2 border-${updateConfig.color}-500 bg-${updateConfig.color}-500/20`}>
                    {index === 0 && (
                      <CheckCircle2 className={`absolute inset-0.5 h-4 w-4 text-${updateConfig.color}-400`} />
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`font-bold uppercase tracking-widest text-${updateConfig.color}-400 text-xs`}>
                        {updateConfig.label}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {format(new Date(update.timestamp), 'h:mm a')}
                      </span>
                    </div>
                    <p className="font-medium text-slate-300 text-sm leading-relaxed">
                      {update.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IncidentTimeline({ incidents = [] }) {
  const [filter, setFilter] = useState('all');

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'resolved') return incident.status === 'resolved' || incident.status === 'completed';
    if (filter === 'ongoing') return incident.status !== 'resolved' && incident.status !== 'completed';
    return true;
  });

  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 font-black text-white text-3xl md:text-5xl">
              Incident History
            </h2>
            <p className="font-medium text-slate-400 text-lg">
              Transparency in every detail
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['all', 'ongoing', 'resolved'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-xs transition-all ${
                  filter === filterType
                    ? 'bg-ruby text-white shadow-[0_0_20px_rgba(224,17,95,0.3)]'
                    : 'border border-white/20 bg-transparent text-white hover:bg-white/10'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {filteredIncidents.length > 0 ? (
          <div className="space-y-6">
            {filteredIncidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/5 bg-surface/30 p-16 text-center">
            <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-emerald-400" />
            <h3 className="mb-3 font-black text-white text-2xl">No Incidents</h3>
            <p className="mx-auto max-w-md font-medium text-slate-400">
              {filter === 'all' 
                ? 'All systems running smoothly with no reported incidents'
                : filter === 'ongoing'
                ? 'No active incidents at this time'
                : 'No resolved incidents in the selected period'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}