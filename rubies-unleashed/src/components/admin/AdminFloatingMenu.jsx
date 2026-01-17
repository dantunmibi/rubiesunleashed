'use client';

import { useState } from 'react';
import { Shield, MessageSquare, ShieldAlert, X } from 'lucide-react';
import AdminCommentModal from './AdminCommentModal';

/**
 * AdminFloatingMenu
 * Small floating button on project pages for quick admin actions
 * Only visible to admins
 */
export default function AdminFloatingMenu({ project }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  if (!project) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl shadow-red-900/50 transition-all hover:scale-110 active:scale-95"
          title="Admin Actions"
        >
          {isOpen ? <X size={24} /> : <Shield size={24} />}
        </button>

        {/* Quick Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-4 bg-[#161b2c] border border-red-500/30 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="p-3 border-b border-white/10 bg-red-500/10">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Admin Actions
              </p>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setShowCommentModal(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3 text-white"
              >
                <MessageSquare size={18} className="text-blue-400" />
                <span className="text-sm font-bold">Leave Comment</span>
              </button>

              
                <a href="/admin"
                target="_blank"
                className="w-full px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3 text-white"
              >
                <ShieldAlert size={18} className="text-red-400" />
                <span className="text-sm font-bold">Open Admin Panel</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <AdminCommentModal
          project={project}
          onClose={() => setShowCommentModal(false)}
          onSuccess={() => setShowCommentModal(false)}
        />
      )}
    </>
  );
}

// ================================================================
// SUMMARY
// ================================================================
// ✅ Floating button only visible to admins
// ✅ Quick access to comment and admin panel
// ✅ Minimal UI, doesn't interfere with main content
// ✅ Can be added to /view/[slug]/page.js