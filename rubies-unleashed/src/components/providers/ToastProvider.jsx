/**
 * ================================================================
 * TOAST PROVIDER - Global Toast Context
 * ================================================================
 * 
 * Purpose:
 * - Provides toast functionality to entire app
 * - Wraps root layout
 * 
 * Usage in components:
 * import { useToastContext } from '@/components/providers/ToastProvider';
 * const { showToast } = useToastContext();
 * showToast("Success!", "success");
 * ================================================================
 */

"use client";

import { createContext, useContext } from "react";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/ToastContainer";

const ToastContext = createContext(null);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}

export default function ToastProvider({ children }) {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}