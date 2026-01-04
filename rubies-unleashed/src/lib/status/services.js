/**
 * SERVICE DEFINITIONS
 * Defines all monitored services for the status page
 * Each service includes monitoring configuration and metadata
 */

export const SERVICES = [
  {
    id: 'api',
    name: 'Blogger API',
    description: 'Primary game data source',
    category: 'core',
    endpoint: '/api/games', // ✅ This should work
    checkType: 'http',
    icon: 'Database',
    criticalPath: true
  },
  {
    id: 'rss',
    name: 'RSS Fallback',
    description: 'Backup content delivery',
    category: 'core',
    endpoint: '/api/games', // ✅ Changed from /api/rss-feed (might not exist)
    checkType: 'http',
    icon: 'Rss',
    criticalPath: true
  },
  {
    id: 'search',
    name: 'Search Engine',
    description: 'Game search & filtering',
    category: 'feature',
    checkType: 'client',
    icon: 'Search',
    criticalPath: false
  },
  {
    id: 'wishlist',
    name: 'Wishlist System',
    description: 'User wishlist storage',
    category: 'feature',
    checkType: 'client',
    icon: 'Heart',
    criticalPath: false
  },
  {
    id: 'forms',
    name: 'Contact Forms',
    description: 'Netlify form submissions',
    category: 'feature',
    endpoint: '/__forms.html',
    checkType: 'http',
    icon: 'Mail',
    criticalPath: false
  },
  {
    id: 'cdn',
    name: 'Image Delivery',
    description: 'Static asset CDN',
    category: 'infrastructure',
    endpoint: '/ru-logo.png',
    checkType: 'http',
    icon: 'Image',
    criticalPath: false
  }
];

export const SERVICE_CATEGORIES = {
  core: {
    label: 'Core Services',
    description: 'Essential platform functionality',
    priority: 1
  },
  feature: {
    label: 'Features',
    description: 'User-facing features',
    priority: 2
  },
  infrastructure: {
    label: 'Infrastructure',
    description: 'Supporting systems',
    priority: 3
  }
};

export const STATUS_TYPES = {
  operational: {
    label: 'Operational',
    color: 'emerald',
    icon: 'CheckCircle2'
  },
  degraded: {
    label: 'Degraded Performance',
    color: 'amber',
    icon: 'AlertTriangle'
  },
  outage: {
    label: 'Major Outage',
    color: 'ruby',
    icon: 'XCircle'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'slate',
    icon: 'Wrench'
  }
};

export const SEVERITY_LEVELS = {
  minor: { label: 'Minor', color: 'blue' },
  major: { label: 'Major', color: 'amber' },
  critical: { label: 'Critical', color: 'ruby' },
  maintenance: { label: 'Maintenance', color: 'slate' }
};