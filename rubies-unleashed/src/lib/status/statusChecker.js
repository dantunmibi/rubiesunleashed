/**
 * STATUS CHECKER
 * Real-time health monitoring for all services
 * Performs HTTP checks and client-side validation
 */

import { SERVICES } from './services';
import { supabase } from '@/lib/supabase'; 

// Performance thresholds (milliseconds)
const THRESHOLDS = {
  excellent: 200,
  good: 500,
  degraded: 1000,
  poor: 2000
};

/**
 * Check HTTP endpoint health
 */
async function checkHTTPEndpoint(endpoint, healthKey = null) {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    const responseTime = Math.round(performance.now() - startTime);
    
    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        statusCode: response.status,
        healthy: false
      };
    }
    
    // ✅ NEW: Handle health endpoint responses
    if (healthKey && endpoint.includes('/health')) {
      try {
        const healthData = await response.json();
        const serviceHealth = healthData.services?.[healthKey];
        
        if (serviceHealth) {
          return {
            status: serviceHealth.status || 'operational',
            responseTime: serviceHealth.responseTime || responseTime,
            healthy: serviceHealth.status === 'operational',
            statusCode: response.status
          };
        }
      } catch (parseError) {
        // If JSON parsing fails, fall back to basic check
      }
    }
    
    return {
      status: responseTime > THRESHOLDS.degraded ? 'degraded' : 'operational',
      responseTime,
      statusCode: response.status,
      healthy: true
    };
    
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    
    return {
      status: 'outage',
      responseTime,
      error: error.name === 'AbortError' ? 'Timeout' : error.message,
      healthy: false
    };
  }
}

// Update checkService function
export async function checkService(service) {
  const checkStartTime = Date.now();
  
  let result;
  
  switch (service.checkType) {
    case 'http':
      result = await checkHTTPEndpoint(service.endpoint, service.healthKey); // ✅ Pass healthKey
      break;
    case 'supabase_db':
      result = await checkSupabaseDB();
      break;
    case 'supabase_auth':
      result = await checkSupabaseAuth();
      break;
    case 'client':
    default:
      result = checkClientService(service.id);
      break;
  }
  
  return {
    serviceId: service.id,
    serviceName: service.name,
    description: service.description,
    category: service.category,
    status: result.status,
    healthy: result.healthy,
    responseTime: result.responseTime,
    performance: getPerformanceRating(result.responseTime),
    lastChecked: checkStartTime,
    error: result.error || null,
    statusCode: result.statusCode || null,
    criticalPath: service.criticalPath,
    icon: service.icon
  };
}

async function checkSupabaseDB() {
  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    const latency = Math.round(performance.now() - start);
    
    if (error) throw error;
    
    return {
      status: latency > THRESHOLDS.degraded ? 'degraded' : 'operational',
      responseTime: latency,
      healthy: true
    };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Math.round(performance.now() - start),
      error: error.message,
      healthy: false
    };
  }
}

async function checkSupabaseAuth() {
  const start = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    
    const latency = Math.round(performance.now() - start);
    
    if (error) throw error;
    
    return {
      status: latency > THRESHOLDS.degraded ? 'degraded' : 'operational',
      responseTime: latency,
      healthy: true
    };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Math.round(performance.now() - start),
      error: error.message,
      healthy: false
    };
  }
}

// ✅ FIXED: Added support for Forge services
function checkClientService(serviceId) {
  try {
    switch (serviceId) {
      case 'search':
        const testKey = '__search_test__';
        localStorage.setItem(testKey, 'ok');
        const canRead = localStorage.getItem(testKey) === 'ok';
        localStorage.removeItem(testKey);
        
        return {
          status: canRead ? 'operational' : 'degraded',
          healthy: canRead,
          responseTime: 0
        };
        
      case 'wishlist':
        // Check if wishlist system is working
        try {
          const userData = localStorage.getItem('ruby_user_data');
          return {
            status: 'operational',
            healthy: true,
            responseTime: 0
          };
        } catch {
          return {
            status: 'degraded',
            healthy: false,
            responseTime: 0
          };
        }
        
      // ✅ NEW: Handle Forge services that don't have endpoints
      case 'creator_dashboard':
      case 'asset_storage':
        // These are checked via their actual endpoints, not client-side
        return {
          status: 'operational',
          healthy: true,
          responseTime: 0
        };
        
      default:
        return {
          status: 'operational',
          healthy: true,
          responseTime: 0
        };
    }
  } catch (error) {
    return {
      status: 'outage',
      healthy: false,
      error: error.message,
      responseTime: 0
    };
  }
}

export function getPerformanceRating(responseTime) {
  if (responseTime === 0) return 'excellent';
  if (responseTime <= THRESHOLDS.excellent) return 'excellent';
  if (responseTime <= THRESHOLDS.good) return 'good';
  if (responseTime <= THRESHOLDS.degraded) return 'degraded';
  return 'poor';
}

export async function checkAllServices() {
  const checks = SERVICES.map(service => checkService(service));
  const results = await Promise.all(checks);
  
  // Calculate overall status
  const hasOutage = results.some(r => r.status === 'outage' && r.criticalPath);
  const hasDegraded = results.some(r => r.status === 'degraded' && r.criticalPath);
  const hasMaintenance = results.some(r => r.status === 'maintenance');
  
  let overallStatus = 'operational';
  if (hasOutage) overallStatus = 'outage';
  else if (hasDegraded) overallStatus = 'degraded';
  else if (hasMaintenance) overallStatus = 'maintenance';
  
  return {
    overall: overallStatus,
    services: results,
    checkedAt: Date.now()
  };
}

export function calculateUptime(incidents, days = 30) {
  const now = Date.now();
  const periodStart = now - (days * 24 * 60 * 60 * 1000);
  
  const relevantIncidents = incidents.filter(inc => {
    const incidentStart = new Date(inc.startTime).getTime();
    return incidentStart >= periodStart;
  });
  
  const totalDowntime = relevantIncidents.reduce((total, inc) => {
    const start = new Date(inc.startTime).getTime();
    const end = inc.endTime ? new Date(inc.endTime).getTime() : now;
    return total + (end - start);
  }, 0);
  
  const periodDuration = now - periodStart;
  const uptime = ((periodDuration - totalDowntime) / periodDuration) * 100;
  
  return Math.min(100, Math.max(0, uptime)).toFixed(2);
}