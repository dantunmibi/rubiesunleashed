/**
 * ================================================================
 * TOAST CONTAINER - Toast Management
 * ================================================================
 * 
 * Purpose:
 * - Manages multiple toasts
 * - Positions toasts in top-right corner
 * - Handles stacking and removal
 * 
 * Features:
 * - Fixed positioning (top-right on desktop, top-center on mobile)
 * - Z-index above modals
 * - Auto-stacking with gaps
 * ================================================================
 */

"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Toast from "./Toast";

export default function ToastContainer({ toasts, removeToast }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 md:right-6 z-1000 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            icon={toast.icon}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}