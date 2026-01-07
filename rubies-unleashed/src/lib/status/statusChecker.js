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
async function checkHTTPEndpoint(endpoint) {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use GET instead of HEAD for better compatibility
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    const responseTime = Math.round(performance.now() - startTime);
    
    // ✅ FIX: Better status determination
    let status = 'operational';
    if (!response.ok) {
      status = 'degraded';
    } else if (responseTime > THRESHOLDS.degraded) {
      status = 'degraded';
    }
    
    return {
      status,
      responseTime,
      statusCode: response.status,
      healthy: response.ok
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

async function checkSupabaseDB() {
  const start = performance.now();
  try {
    // Simple query: Count profiles (fast, low cost)
    // We limit to 1 to minimize load
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

/**
 * Check Supabase Auth Health
 */
async function checkSupabaseAuth() {
  const start = performance.now();
  try {
    // Check session retrieval (doesn't hit DB, hits Auth server)
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

/**
 * Check client-side service health
 */
function checkClientService(serviceId) {
  try {
    switch (serviceId) {
      case 'search':
        // Verify search can access localStorage
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
        // Verify wishlist storage access
        const userData = localStorage.getItem('ruby_user_data');
        const canParse = userData ? JSON.parse(userData) : true;
        
        return {
          status: canParse ? 'operational' : 'degraded',
          healthy: !!canParse,
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


/**
 * Get performance rating based on response time
 */
export function getPerformanceRating(responseTime) {
  if (responseTime === 0) return 'excellent'; // Client-side services
  if (responseTime <= THRESHOLDS.excellent) return 'excellent';
  if (responseTime <= THRESHOLDS.good) return 'good';
  if (responseTime <= THRESHOLDS.degraded) return 'degraded';
  return 'poor';
}

/**
 * Check single service health
 */
export async function checkService(service) {
  const checkStartTime = Date.now();
  
  let result;
    // ✅ Handle new check types
  if (service.checkType === 'http') {
    result = await checkHTTPEndpoint(service.endpoint);
  } else if (service.checkType === 'supabase_db') {
    result = await checkSupabaseDB();
  } else if (service.checkType === 'supabase_auth') {
    result = await checkSupabaseAuth();
  } else {
    result = checkClientService(service.id);
  }
  
  if (service.checkType === 'http') {
    result = await checkHTTPEndpoint(service.endpoint);
  } else {
    result = checkClientService(service.id);
  }
  
  return {
    serviceId: service.id,
    serviceName: service.name,
    status: result.status,
    healthy: result.healthy,
    responseTime: result.responseTime,
    performance: getPerformanceRating(result.responseTime),
    lastChecked: checkStartTime,
    error: result.error || null,
    statusCode: result.statusCode || null
  };
}

/**
 * Check all services
 */
export async function checkAllServices() {
  const checks = SERVICES.map(service => checkService(service));
  const results = await Promise.all(checks);
  
  // Calculate overall status
  const hasOutage = results.some(r => r.status === 'outage' && SERVICES.find(s => s.id === r.serviceId)?.criticalPath);
  const hasDegraded = results.some(r => r.status === 'degraded' && SERVICES.find(s => s.id === r.serviceId)?.criticalPath);
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

/**
 * Calculate uptime percentage
 */
export function calculateUptime(incidents, days = 30) {
  const now = Date.now();
  const periodStart = now - (days * 24 * 60 * 60 * 1000);
  
  // Filter incidents in the period
  const relevantIncidents = incidents.filter(inc => {
    const incidentStart = new Date(inc.startTime).getTime();
    return incidentStart >= periodStart;
  });
  
  // Calculate total downtime
  const totalDowntime = relevantIncidents.reduce((total, inc) => {
    const start = new Date(inc.startTime).getTime();
    const end = inc.endTime ? new Date(inc.endTime).getTime() : now;
    return total + (end - start);
  }, 0);
  
  const periodDuration = now - periodStart;
  const uptime = ((periodDuration - totalDowntime) / periodDuration) * 100;
  
  return Math.min(100, Math.max(0, uptime)).toFixed(2);
}