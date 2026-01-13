/**
 * SERVICE DEFINITIONS (Phase 4 - The Forge Complete)
 * Defines critical infrastructure monitoring including creator platform.
 */

export const SERVICES = [
  // CORE SERVICES (Critical Path)
  {
    id: 'api',
    name: 'Content Delivery API',
    description: 'Unified game feed (Blogger + Community)',
    category: 'core',
    endpoint: '/api/games?limit=1',
    checkType: 'http',
    icon: 'Database',
    criticalPath: true
  },
  {
    id: 'auth',
    name: 'Identity System',
    description: 'User authentication & creator accounts',
    category: 'core',
    endpoint: '/api/health',
    checkType: 'http',
    healthKey: 'auth', // ✅ NEW: Which key to read from health response
    icon: 'Shield',
    criticalPath: true
  },
  {
    id: 'db',
    name: 'Database Cluster',
    description: 'Core database connectivity',
    category: 'core',
    endpoint: '/api/health',
    checkType: 'http',
    healthKey: 'database', // ✅ NEW: Which key to read from health response
    icon: 'Server',
    criticalPath: true
  },

  // THE FORGE (Creator Platform)
  {
    id: 'forge_api',
    name: 'Project Management API',
    description: 'Creator project CRUD operations',
    category: 'forge',
    endpoint: '/api/health',
    checkType: 'http',
    healthKey: 'projects_api', // ✅ NEW: Which key to read from health response
    icon: 'Wrench',
    criticalPath: true
  },
  {
    id: 'asset_storage',
    name: 'Asset Storage',
    description: 'Project images & media hosting',
    category: 'forge',
    endpoint: '/api/health',
    checkType: 'http',
    healthKey: 'database', // ✅ Storage uses same DB connection
    icon: 'Image',
    criticalPath: true
  },
  {
    id: 'creator_dashboard',
    name: 'Creator Dashboard',
    description: 'Project management interface',
    category: 'forge',
    endpoint: '/api/health',
    checkType: 'http',
    healthKey: 'database', // ✅ Dashboard uses profiles table
    icon: 'LayoutDashboard',
    criticalPath: false
  },

  // USER FEATURES
  {
    id: 'search',
    name: 'Search Engine',
    description: 'Unified content discovery',
    category: 'feature',
    checkType: 'client',
    icon: 'Search',
    criticalPath: false
  },
  {
    id: 'wishlist',
    name: 'Wishlist System',
    description: 'Personal collections & social sharing',
    category: 'feature',
    endpoint: '/api/health',
    checkType: 'http',
    healthKey: 'wishlist_api', // ✅ NEW: Which key to read from health response
    icon: 'Heart',
    criticalPath: false
  },
  {
    id: 'forms',
    name: 'Submission System',
    description: 'Contact & feedback forms',
    category: 'feature',
    endpoint: '/__forms.html',
    checkType: 'http',
    icon: 'Mail',
    criticalPath: false
  },

  // INFRASTRUCTURE
  {
    id: 'cdn',
    name: 'Global CDN',
    description: 'Static asset delivery',
    category: 'infrastructure',
    endpoint: '/rubieslogo.png',
    checkType: 'http',
    icon: 'Globe',
    criticalPath: false
  },
  {
    id: 'security',
    name: 'Security Layer',
    description: 'RLS policies & external link protection',
    category: 'infrastructure',
    checkType: 'client',
    icon: 'Shield',
    criticalPath: false
  }
];

export const SERVICE_CATEGORIES = {
  core: {
    label: 'Core Platform',
    description: 'Essential platform functionality',
    priority: 1
  },
  forge: {
    label: 'The Forge',
    description: 'Creator platform & project management',
    priority: 2
  },
  feature: {
    label: 'User Features',
    description: 'Discovery, social & engagement tools',
    priority: 3
  },
  infrastructure: {
    label: 'Infrastructure',
    description: 'Supporting systems & security',
    priority: 4
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

// Phase tracking for status page
export const PLATFORM_PHASES = {
  current: 'Phase 4: The Forge',
  completed: ['Phase 1: Foundation', 'Phase 2: Resilience', 'Phase 3: Identity', 'Phase 4: The Forge'],
  next: 'Phase 5: Analytics & Social'
};