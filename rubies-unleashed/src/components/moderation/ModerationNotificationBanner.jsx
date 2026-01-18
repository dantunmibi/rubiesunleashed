import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { AlertTriangle, X, Eye, Clock, Shield } from 'lucide-react';

/**
 * ModerationNotificationBanner
 * Shows at the top of creator dashboard when admin takes action on their projects
 */
export default function ModerationNotificationBanner() {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchModerationActions();
  }, [user]);

  const fetchModerationActions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select('*')
        .eq('developer_id', user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActions(data || []);
    } catch (error) {
      console.error('Failed to fetch moderation actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAction = async (actionId) => {
    try {
      const { error } = await supabase
        .from('moderation_actions')
        .update({ 
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', actionId);

      if (error) throw error;

      // Remove from local state
      setActions(prev => prev.filter(a => a.id !== actionId));
    } catch (error) {
      console.error('Failed to acknowledge action:', error);
    }
  };

  if (loading || actions.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {actions.map((action) => (
        <ModerationAlert 
          key={action.id} 
          action={action} 
          onDismiss={() => acknowledgeAction(action.id)} 
        />
      ))}
    </div>
  );
}

function ModerationAlert({ action, onDismiss }) {
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  const actionConfig = {
    hide: {
      color: 'amber',
      icon: Eye,
      title: 'Project Hidden from Public Feed',
      description: 'Your project has been removed from public listings but you can still edit it.',
      showRequestReview: true // ✅ NEW
    },
  ban: {
    color: 'red',
    icon: Shield,
    title: '🚫 Project Banned - Pending Deletion',
    description: 'This project has been banned and is queued for permanent deletion. All data will be removed.',
    showRequestReview: false,
    showExport: true, // ✅ NEW
    showSupport: true, // ✅ NEW
    deletionWarning: true // ✅ NEW
  },
    delete: {
      color: 'red',
      icon: AlertTriangle,
      title: 'Project Archived by Admin',
      description: 'Your project has been moved to archived status and is no longer visible publicly.',
      showRequestReview: false
    },
    restore: {
      color: 'emerald',
      icon: Shield,
      title: 'Project Restored',
      description: 'Your project has been restored and is now live again.',
      showRequestReview: false
    },
    unban: {
      color: 'emerald',
      icon: Shield,
      title: 'Project Unbanned',
      description: 'Your project has been unbanned and set to draft. You can now edit and republish it.',
      showRequestReview: false
    }
  };

  const config = actionConfig[action.action_type] || actionConfig.hide;
  const Icon = config.icon;

  const colorClasses = {
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  };

  const bgClass = colorClasses[config.color];

  // ✅ NEW: Request Review Handler
  const handleRequestReview = async () => {
    setRequestingReview(true);
    
    try {
      const { error } = await supabase
        .from('moderation_actions')
        .insert({
          project_id: action.project_id,
          project_title: action.project_title,
          developer_id: action.developer_id,
          developer_username: action.developer_username,
          action_type: 'review_request',
          reason: 'Creator requested review of hidden content',
          metadata: {
            original_hide_action_id: action.id,
            request_date: new Date().toISOString()
          }
        });

      if (error) throw error;

      setReviewRequested(true);
      
      // Auto-acknowledge the original hide action after requesting review
      setTimeout(() => {
        onDismiss();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to request review:', error);
      alert('Failed to submit review request. Please try again.');
    } finally {
      setRequestingReview(false);
    }
  };

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
                <span className="font-mono">{action.project_title}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(action.created_at).toLocaleDateString()}
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

{/* Admin Reason */}
<div className="bg-black/30 border border-white/10 rounded-xl p-4">
  <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
    <Shield size={12} />
    Platform Team Message
  </p>
  <p className="text-sm text-white leading-relaxed">
    {action.reason}
  </p>
</div>

{/* ✅ NEW: Deletion Warning for Banned Projects */}
{config.deletionWarning && (
  <div className="mt-4 bg-red-950/30 border border-red-500/30 rounded-xl p-4">
    <div className="flex items-start gap-3">
      <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-bold text-red-400 mb-2">Scheduled for Permanent Deletion</h4>
        <p className="text-sm text-red-300/80 mb-3">
          This project violated platform guidelines and will be permanently removed. 
          All project data, files, and statistics will be deleted.
        </p>
        <div className="flex items-center gap-2 text-xs text-red-400/70">
          <Clock size={12} />
          <span>Banned: {new Date(action.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>Deletion: Within 30 days (admin discretion)</span>
        </div>
      </div>
    </div>
  </div>
)}

{/* ✅ NEW: Export + Support Buttons for Banned Projects */}
{config.showExport && (
  <div className="mt-4 pt-4 border-t border-white/10">
    <p className="text-xs text-slate-400 mb-3">
      If you believe this is an error, contact support immediately. 
      You can export your project data before deletion.
    </p>
    
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => {
          // ✅ TODO: Implement export functionality
          window.open(`/api/projects/export?id=${action.project_id}`, '_blank');
        }}
        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Export Project Data
      </button>
      
      <a
        href="/contact"
        className="bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Shield size={16} />
        Contact Support
      </a>
    </div>
  </div>
)}

          {/* Metadata */}
          {action.metadata && (
            <div className="mt-3 flex gap-3 text-xs text-slate-500">
              {action.metadata.previous_status && (
                <span>
                  Status: <span className="text-slate-400">{action.metadata.previous_status}</span>
                  {' → '}
                  <span className="text-white font-bold">{action.metadata.new_status}</span>
                </span>
              )}
            </div>
          )}

          {/* ✅ NEW: Request Review Button (only for hidden projects) */}
          {config.showRequestReview && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {reviewRequested ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Shield size={16} className="text-emerald-400" />
                  <p className="text-sm text-emerald-400 font-bold">
                    ✓ Review request submitted! An admin will review your project soon.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleRequestReview}
                  disabled={requestingReview}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {requestingReview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Request Review
                    </>
                  )}
                </button>
              )}
              <p className="text-xs text-slate-500 text-center mt-2">
                Think this was a mistake? Request an admin to review your project.
              </p>
            </div>
          )}

          {/* Action Taken By */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>
              Action by: <span className="text-slate-400 font-mono">{action.admin_username}</span>
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

/**
 * ModerationHistorySection
 * Shows in settings or a dedicated page - full history of moderation actions
 */
export function ModerationHistory() {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchAllActions();
  }, [user]);

  const fetchAllActions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select('*')
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActions(data || []);
    } catch (error) {
      console.error('Failed to fetch moderation history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Shield size={48} className="mx-auto mb-4 opacity-20" />
        <p>No moderation actions on your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Shield size={20} className="text-red-500" />
        Moderation History ({actions.length})
      </h3>

      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`bg-black/20 border rounded-xl p-4 ${
              action.acknowledged ? 'border-white/5 opacity-60' : 'border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    action.action_type === 'restore' || action.action_type === 'unban'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {action.action_type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(action.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-bold text-white">{action.project_title}</p>
              </div>

              {action.acknowledged && (
                <span className="text-xs text-slate-600 uppercase">Acknowledged</span>
              )}
            </div>

            <div className="bg-white/5 rounded-lg p-3 mt-2">
              <p className="text-sm text-slate-300">{action.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}