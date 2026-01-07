/**
 * SERVICE DEFINITIONS (Phase 4)
 * Defines critical infrastructure monitoring.
 */

export const SERVICES = [
  {
    id: 'api',
    name: 'Content Delivery API',
    description: 'Game feed and metadata',
    category: 'core',
    endpoint: '/api/games?limit=1', // Check fetching just 1 item for speed
    checkType: 'http',
    icon: 'Database',
    criticalPath: true
  },
  {
    id: 'auth',
    name: 'Identity System',
    description: 'User authentication & session management',
    category: 'core',
    checkType: 'supabase_auth', // Validates Login
    icon: 'Shield',
    criticalPath: true
  },
  {
    id: 'db',
    name: 'Database Cluster',
    description: 'User profiles & wishlist storage',
    category: 'core',
    checkType: 'supabase_db', // Validates Data Read
    icon: 'Server',
    criticalPath: true
  },
  {
    id: 'search',
    name: 'Search Engine',
    description: 'Client-side index',
    category: 'feature',
    checkType: 'client',
    icon: 'Search',
    criticalPath: false
  },
  {
    id: 'forms',
    name: 'Submission System',
    description: 'Contact & Publish forms',
    category: 'feature',
    endpoint: '/__forms.html',
    checkType: 'http',
    icon: 'Mail',
    criticalPath: false
  },
  {
    id: 'cdn',
    name: 'Global CDN',
    description: 'Static asset delivery',
    category: 'infrastructure',
    endpoint: '/rubieslogo.png', // Check your actual logo
    checkType: 'http',
    icon: 'Globe',
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