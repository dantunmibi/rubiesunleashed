'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { MessageSquare, X, Clock, Shield } from 'lucide-react';

/**
 * AdminCommentBanner
 * Shows unacknowledged admin comments on developer dashboard
 * Similar to ModerationNotificationBanner
 */
export default function AdminCommentBanner() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchComments();
  }, [user]);

  const fetchComments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_comments')
        .select('*')
        .eq('developer_id', user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Failed to fetch admin comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('admin_comments')
        .update({ 
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // Remove from local state
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to acknowledge comment:', error);
    }
  };

  if (loading || comments.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {comments.map((comment) => (
        <CommentAlert 
          key={comment.id} 
          comment={comment} 
          onDismiss={() => acknowledgeComment(comment.id)} 
        />
      ))}
    </div>
  );
}

function CommentAlert({ comment, onDismiss }) {
  const commentConfig = {
    feedback: {
      color: 'blue',
      icon: MessageSquare,
      title: 'Admin Feedback Received',
      description: 'The platform team has left feedback on your project.'
    },
    moderation: {
      color: 'amber',
      icon: Shield,
      title: 'Moderation Notice',
      description: 'The platform team has left an important notice about your project.'
    }
  };

  const config = commentConfig[comment.comment_type] || commentConfig.feedback;
  const Icon = config.icon;

  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  };

  const bgClass = colorClasses[config.color];

  return (
    <div className={`${bgClass} border rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in duration-500`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${bgClass} shrink-0`}>
          <Icon size={24} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-bold text-white text-lg mb-1">
                {config.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-mono">{comment.project_title}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white shrink-0"
              title="Dismiss"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 mb-4">
            {config.description}
          </p>

          {/* Admin Comment */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Shield size={12} />
              Platform Team Message
            </p>
            <p className="text-sm text-white leading-relaxed">
              {comment.comment}
            </p>
          </div>

          {/* Action Taken By */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>
              From: <span className="text-slate-400 font-mono">{comment.admin_username}</span>
            </span>
            
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white font-bold uppercase tracking-wider transition-colors"
            >
              Acknowledge →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SUMMARY
// ================================================================
// ✅ Fetches unacknowledged admin comments for current user
// ✅ Displays banner similar to ModerationNotificationBanner
// ✅ Different styles for 'feedback' vs 'moderation' comments
// ✅ Developers can acknowledge to dismiss
// ✅ Auto-hides when no comments