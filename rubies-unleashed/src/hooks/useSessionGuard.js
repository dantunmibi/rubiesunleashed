'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSessionGuard() {
  const [showSessionError, setShowSessionError] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const triggerError = useCallback(() => setShowSessionError(true), []);

  const isSessionError = useCallback((error) => {
    if (!error) return false;

    const errorIndicators = [
      'JWT',
      'expired',
      'invalid',
      'PGRST301',
      'token',
      'unauthorized'
    ];

    const errorString = typeof error === 'string' 
      ? error 
      : error.message || error.code || '';

    return errorIndicators.some(indicator => 
      errorString.toLowerCase().includes(indicator.toLowerCase())
    );
  }, []);

  const checkSupabaseError = useCallback((error) => {
    if (isSessionError(error)) {
      console.error('🚨 Session error detected:', error);
      setShowSessionError(true);
      return true;
    }
    return false;
  }, [isSessionError]);

  const checkApiError = useCallback((response) => {
    if (response.status === 401) {
      console.error('🚨 API returned 401 Unauthorized');
      setShowSessionError(true);
      return true;
    }
    return false;
  }, []);

  const validateSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        setShowSessionError(true);
        return false;
      }
      
      setSessionValid(true);
      return true;
    } catch (err) {
      console.error('Session validation failed:', err);
      setShowSessionError(true);
      return false;
    }
  }, []);

  const resetSessionError = useCallback(() => {
    setShowSessionError(false);
  }, []);

  return {
    showSessionError,
    triggerError,
    sessionValid,
    checkSupabaseError,
    checkApiError,
    validateSession,
    resetSessionError,
    isSessionError
  };
}