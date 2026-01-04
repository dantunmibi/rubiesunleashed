/**
 * USE SERVICE STATUS HOOK
 * Real-time service monitoring with auto-refresh
 * Manages status checks and update intervals
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkAllServices } from '@/lib/status/statusChecker';

export function useServiceStatus(autoRefresh = true, interval = 60000) {
  const [status, setStatus] = useState({
    overall: 'operational',
    services: [],
    checkedAt: null,
    loading: true,
    error: null
  });
  
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const results = await checkAllServices();
      setStatus({
        ...results,
        loading: false,
        error: null
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Initial check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(checkStatus, interval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, interval, checkStatus]);

  return {
    ...status,
    isChecking,
    refresh: checkStatus
  };
}