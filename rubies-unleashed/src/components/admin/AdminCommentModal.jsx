'use client';

import { useState } from 'react';
import { X, MessageSquare, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notifyAdminComment } from '@/lib/projectNotifications';

/**
 * AdminCommentModal
 * Modal for admins to leave comments on projects
 */
export default function AdminCommentModal({ project, onClose, onSuccess }) {
  const [comment, setComment] = useState('');
  const [commentType, setCommentType] = useState('feedback');
  const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!comment.trim()) {
    alert('Please enter a comment');
    return;
  }

  setSubmitting(true);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch('/api/admin/comments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        project_id: project.id,
        comment: comment.trim(),
        comment_type: commentType
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create comment');
    }

    const result = await response.json();
    
    // ✅ REMOVED: notifyAdminComment() call - API handles it now
    
    // Show success message
    if (result.notification_sent) {
      alert('✅ Comment sent successfully and developer notified');
    } else {
      alert('✅ Comment sent successfully (notification delivery pending)');
    }
    
    setComment('');
    onSuccess?.();
    onClose();
    
  } catch (error) {
    console.error('Failed to create comment:', error);
    alert(`❌ Failed to send comment: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161b2c] border border-blue-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
            <MessageSquare size={24} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Leave Comment</h3>
            <p className="text-sm text-slate-400 mt-1">
              {project.title}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Comment Type */}
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Comment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCommentType('feedback')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  commentType === 'feedback'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <MessageSquare size={20} className={commentType === 'feedback' ? 'text-blue-500' : 'text-slate-400'} />
                <p className="font-bold text-sm mt-2 text-white">Feedback</p>
                <p className="text-xs text-slate-400 mt-1">Suggestions for improvement</p>
              </button>

              <button
                type="button"
                onClick={() => setCommentType('moderation')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  commentType === 'moderation'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Shield size={20} className={commentType === 'moderation' ? 'text-amber-500' : 'text-slate-400'} />
                <p className="font-bold text-sm mt-2 text-white">Moderation</p>
                <p className="text-xs text-slate-400 mt-1">Official notice or warning</p>
              </button>
            </div>
          </div>

          {/* Comment Text */}
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Message to Developer
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your feedback or notice here..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500 outline-none min-h-32 resize-none"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              This message will be visible to the developer on their dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!comment.trim() || submitting}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
              Send Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================================================================
// SUMMARY
// ================================================================
// ✅ Modal for admins to write comments
// ✅ Two comment types: feedback and moderation
// ✅ Validates input before submission
// ✅ Calls API route to create comment
// ✅ Triggers notification for developer
// ✅ Shows success/error feedback