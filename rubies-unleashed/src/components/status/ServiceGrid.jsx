/**
 * SERVICE GRID - BRAND-ALIGNED CARDS
 * Matches ValueCard style from About page
 * Hover effects, glow backgrounds, story-first presentation
 */

'use client';

import { 
  CheckCircle2, AlertTriangle, XCircle, Wrench,
  Database, Rss, Search, Heart, Mail, Image,
  Clock, Zap
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/status/services';

const ICON_MAP = {
  Database, Rss, Search, Heart, Mail, Image
};

const STATUS_CONFIG = {
  operational: {
    icon: CheckCircle2,
    color: 'emerald',
    label: 'Operational',
    iconBg: 'bg-emerald-500/20',
    iconBorder: 'border-emerald-500/50',
    iconColor: 'text-emerald-400'
  },
  degraded: {
    icon: AlertTriangle,
    color: 'amber',
    label: 'Degraded',
    iconBg: 'bg-amber-500/20',
    iconBorder: 'border-amber-500/50',
    iconColor: 'text-amber-400'
  },
  outage: {
    icon: XCircle,
    color: 'ruby',
    label: 'Outage',
    iconBg: 'bg-ruby/20',
    iconBorder: 'border-ruby/50',
    iconColor: 'text-ruby'
  },
  maintenance: {
    icon: Wrench,
    color: 'slate',
    label: 'Maintenance',
    iconBg: 'bg-slate-500/20',
    iconBorder: 'border-slate-500/50',
    iconColor: 'text-slate-400'
  }
};

const PERFORMANCE_CONFIG = {
  excellent: { label: 'Excellent', color: 'emerald' },
  good: { label: 'Good', color: 'green' },
  degraded: { label: 'Slow', color: 'amber' },
  poor: { label: 'Poor', color: 'ruby' }
};

function ServiceCard({ service }) {
  const statusConfig = STATUS_CONFIG[service.status] || STATUS_CONFIG.operational;
  const StatusIcon = statusConfig.icon;
  const ServiceIcon = ICON_MAP[service.icon] || Database;
  const perfConfig = PERFORMANCE_CONFIG[service.performance] || PERFORMANCE_CONFIG.good;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-surface/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-ruby/30">
      {/* Background Glow (Like ValueCard) */}
      <div className={`absolute inset-0 bg-linear-to-b from-${statusConfig.color}-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
      
      <div className="relative">
        {/* Icon Container (Matches About page icon style) */}
        <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${statusConfig.iconBorder} ${statusConfig.iconBg} shadow-lg transition-transform group-hover:scale-110`}>
          <ServiceIcon className={`h-7 w-7 ${statusConfig.iconColor}`} />
        </div>

        {/* Service Name & Description */}
        <h3 className="mb-2 font-black uppercase tracking-wide text-white text-xl">
          {service.serviceName}
        </h3>
        <p className="mb-6 font-medium text-slate-400 text-sm leading-relaxed">
          {service.description}
        </p>

        {/* Status Badge */}
        <div className={`mb-6 inline-flex items-center gap-2 rounded-full border border-${statusConfig.color}-500/30 bg-${statusConfig.color}-500/10 px-4 py-2`}>
          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
          <span className={`font-bold uppercase tracking-widest ${statusConfig.iconColor} text-xs`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Metrics (Only for HTTP services) */}
        {service.responseTime > 0 && (
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            {/* Response Time */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-slate-500 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium uppercase tracking-wider">Response</span>
              </div>
              <p className="font-black text-white text-2xl">{service.responseTime}ms</p>
            </div>

            {/* Performance */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-slate-500 text-xs">
                <Zap className="h-3.5 w-3.5" />
                <span className="font-medium uppercase tracking-wider">Speed</span>
              </div>
              <p className={`font-bold uppercase tracking-wide text-${perfConfig.color}-400 text-sm`}>
                {perfConfig.label}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {service.error && (
          <div className="mt-4 rounded-xl border border-ruby/20 bg-ruby/5 p-4">
            <p className="font-medium text-ruby text-sm">{service.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceGrid({ services = [] }) {
  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'core';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  // Sort categories by priority
  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    const priorityA = SERVICE_CATEGORIES[a]?.priority || 999;
    const priorityB = SERVICE_CATEGORIES[b]?.priority || 999;
    return priorityA - priorityB;
  });

  return (
    <div className="space-y-20">
      {sortedCategories.map(categoryKey => {
        const category = SERVICE_CATEGORIES[categoryKey];
        const categoryServices = groupedServices[categoryKey];

        return (
          <section key={categoryKey} className="relative px-6">
            {/* Category Header */}
            <div className="mx-auto mb-12 max-w-7xl text-center">
              <h2 className="mb-4 font-black text-white text-3xl md:text-5xl">
                {category?.label || categoryKey}
              </h2>
              <p className="mx-auto max-w-2xl text-slate-400 text-lg">
                {category?.description || ''}
              </p>
            </div>

            {/* Service Cards Grid */}
            <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryServices.map(service => (
                <ServiceCard key={service.serviceId} service={service} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}