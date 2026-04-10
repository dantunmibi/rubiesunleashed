'use client';

import { useState, useEffect, useCallback } from 'react';
import { SERVICES } from '@/lib/status/services';

function getPerformanceRating(responseTime) {
  if (!responseTime || responseTime === 0) return 'excellent';
  if (responseTime <= 300) return 'excellent';
  if (responseTime <= 700) return 'good';      // ✅ Supabase ~500ms = Good, not Slow
  if (responseTime <= 1500) return 'degraded';
  return 'poor';
}

/**
 * Client-side checks for services that can't be server-checked
 * These run in the browser but measure local browser capability,
 * not network/server health — so they're valid here
 */
function checkClientService(serviceId, serverServices = {}) {
  switch (serviceId) {
    case 'search': {
      try {
        const testKey = '__search_test__';
        localStorage.setItem(testKey, 'ok');
        const ok = localStorage.getItem(testKey) === 'ok';
        localStorage.removeItem(testKey);
        return {
          status: ok ? 'operational' : 'degraded',
          healthy: ok,
          responseTime: 0,
        };
      } catch {
        return { status: 'degraded', healthy: false, responseTime: 0 };
      }
    }

    case 'security': {
      // Security is only as healthy as the database (RLS lives there)
      const db = serverServices['database'];
      return {
        status: db?.status ?? 'operational',
        healthy: db?.status === 'operational',
        responseTime: 0,
      };
    }

    default:
      return { status: 'operational', healthy: true, responseTime: 0 };
  }
}

function buildEnrichedServices(apiServices = {}) {
  return SERVICES.map(serviceMeta => {
    // Client-type services get browser checks
    if (serviceMeta.checkType === 'client') {
      const result = checkClientService(serviceMeta.id, apiServices);
      return {
        serviceId: serviceMeta.id,
        serviceName: serviceMeta.name,
        description: serviceMeta.description,
        category: serviceMeta.category,
        icon: serviceMeta.icon,
        criticalPath: serviceMeta.criticalPath ?? false,
        status: result.status,
        responseTime: result.responseTime,
        healthy: result.healthy,
        performance: getPerformanceRating(result.responseTime),
        error: null,
      };
    }

    // Server-checked services — read from API response by healthKey
    const healthKey = serviceMeta.healthKey ?? serviceMeta.id;
    const serviceData = apiServices[healthKey];

    return {
      serviceId: serviceMeta.id,
      serviceName: serviceMeta.name,
      description: serviceMeta.description,
      category: serviceMeta.category,
      icon: serviceMeta.icon,
      criticalPath: serviceMeta.criticalPath ?? false,
      status: serviceData?.status ?? 'operational',
      responseTime: serviceData?.responseTime ?? 0,
      healthy: serviceData?.status === 'operational',
      performance: getPerformanceRating(serviceData?.responseTime ?? 0),
      error: serviceData?.error ?? null,
    };
  });
}

export function useServiceStatus(autoRefresh = true, interval = 60000) {
  const [status, setStatus] = useState({
    overall: 'operational',
    services: [],
    checkedAt: null,
    loading: true,
    error: null,
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);

    try {
      const res = await fetch('/api/status-check', {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`Status check failed: HTTP ${res.status}`);

      const data = await res.json();

      // Build full enriched list — server data + client checks merged
      const enrichedServices = buildEnrichedServices(data.services ?? {});

      setStatus({
        overall: data.overall ?? 'operational',
        services: enrichedServices,
        checkedAt: data.checkedAt ?? Date.now(),
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const intervalId = setInterval(checkStatus, interval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, interval, checkStatus]);

  return {
    ...status,
    isChecking,
    refresh: checkStatus,
  };
}