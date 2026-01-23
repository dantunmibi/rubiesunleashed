'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToastContext } from '@/components/providers/ToastProvider';
import { supabase } from '@/lib/supabase'; 
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { notifyProjectPublished, notifyProjectDeleted, notifyProjectUnpublished } from '@/lib/projectNotifications';
import SessionErrorOverlay from '@/components/ui/SessionErrorOverlay'; 
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { 
  Loader2, Edit, BarChart3, MessageSquare, ShieldAlert, ArrowLeft, 
  Globe, Eye, Download, Save, Archive, Trash2, Rocket, RefreshCw, AlertTriangle, Shield
} from "lucide-react";
import Link from "next/link";
import AdminCommentBanner from '@/components/moderation/AdminCommentBanner';

/**
 * ================================================================
 * PROJECT COCKPIT - Enhanced Project Management Interface
 * ================================================================
 * 
 * Features:
 * - Real-time session validation and recovery
 * - Optimistic UI updates with rollback on failure
 * - Enhanced archive confirmation modal
 * - Session status monitoring
 * - Automatic session refresh on page focus
 * - Comprehensive error handling
 * - Beautiful status management interface
 * 
 * Security:
 * - Session validation before all operations
 * - Fresh token retrieval for each API call
 * - Automatic session recovery on expiry
 * - Protected state management
 * ================================================================
 */

export default function ProjectCockpit({ 
  project: initialProject, 
  onProjectUpdate, 
  onRefreshProject 
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const { showSessionError, checkApiError, validateSession, triggerError } = useSessionGuard();
  
  // ✅ Modal States
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  // ✅ Session Monitoring
  const [sessionStatus, setSessionStatus] = useState('checking'); // 'valid', 'expired', 'checking'
  
  // ✅ Project State Management
  const [project, setProject] = useState(initialProject);

  // ✅ Sync with parent when prop changes
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  // ✅ Helper to update both local and parent state
  const updateProject = (updatedProject) => {
    setProject(updatedProject);
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject);
    }
  };

  // ✅ Session status checker - monitors session health every 30 seconds
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setSessionStatus('expired');
        } else {
          setSessionStatus('valid');
        }
      } catch (error) {
        setSessionStatus('expired');
      }
    };

    checkSessionStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkSessionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Session refresh on page focus - validates session when user returns
  useEffect(() => {
    const handleFocus = async () => {
      console.log('👁️ Page focused, checking session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.log('❌ No valid session on focus');
          setSessionStatus('expired');
          return;
        }
        
        console.log('✅ Session valid on focus');
        setSessionStatus('valid');
        
        // Optional: Refresh project data if session is valid
        if (onRefreshProject) {
          onRefreshProject();
        }
      } catch (error) {
        console.error('❌ Session check on focus failed:', error);
        setSessionStatus('expired');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onRefreshProject]);

  // ✅ Safety valve - prevents infinite loading states
  useEffect(() => {
    let timer;
    if (loading) {
        timer = setTimeout(() => {
            console.warn("Operation timed out. Triggering session recovery.");
            setLoading(false);
            if (triggerError) triggerError();
        }, 10000);
    }
    return () => clearTimeout(timer);
  }, [loading, triggerError]);

  // ✅ Auth helper - gets fresh token with validation
  const getAuthToken = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
          throw new Error("AUTH_EXPIRED");
      }
      return session.access_token;
  };

  // ✅ Enhanced status change with comprehensive session validation
  const handleStatusChange = async (newStatus) => {
    // ✅ UPDATED: Validation - require cover + (download OR video OR screenshots)
    if (newStatus === 'published') {
      if (!project.cover_url) { 
        showToast('Cover image required to publish', 'error'); 
        return; 
      }
      
      const hasDownload = project.download_links && project.download_links.length > 0 && project.download_links[0].url;
      const hasVideo = project.video_url;
      const hasScreenshots = project.screenshots && project.screenshots.length > 0;
      
      if (!hasDownload && !hasVideo && !hasScreenshots) {
        showToast('Requires either: download link, demo video, or screenshots to publish', 'error');
        return;
      }
    }

    // ✅ Validate session BEFORE showing confirmation
    console.log('🔐 Validating session before status change...');
    if (!(await validateSession())) {
      console.log('❌ Session validation failed');
      return;
    }

    // ✅ Get fresh token and validate it
    let session;
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error || !sessionData.session) {
        console.log('❌ No valid session found');
        if (triggerError) triggerError();
        return;
      }
      session = sessionData.session;
      console.log('✅ Fresh session obtained');
    } catch (error) {
      console.error('❌ Session fetch failed:', error);
      if (triggerError) triggerError();
      return;
    }

    // Show confirmation for archive (only after session is validated)
    if (newStatus === 'archived') {
      setShowArchiveModal(true);
      return; // Don't proceed until user confirms
    }

    // Proceed with status change
    await executeStatusChange(newStatus, session);
  };

  // ✅ Separate function for actual status change execution
// In your executeStatusChange function, add notifications after successful API call:

const executeStatusChange = async (newStatus, session = null) => {
    setLoading(true);
    
    // ✅ Optimistic update - immediately update UI for better UX
    const previousProject = project;
    const optimisticProject = { ...project, status: newStatus };
    updateProject(optimisticProject);

    try {
      // ✅ Use provided session or get fresh one
      if (!session) {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error || !sessionData.session) {
          throw new Error('AUTH_EXPIRED');
        }
        session = sessionData.session;
      }
      
      const res = await fetch('/api/projects/update', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: project.id, status: newStatus })
      });
      
      if (checkApiError(res)) {
        // ✅ Revert on API error
        updateProject(previousProject);
        return;
      }

      if (!res.ok) {
        // ✅ Handle specific error cases
        if (res.status === 401) {
          throw new Error('AUTH_EXPIRED');
        }
        updateProject(previousProject);
        throw new Error('Status update failed');
      }
      
      const { project: updatedProject } = await res.json();
      
      // ✅ ADD NOTIFICATIONS BASED ON STATUS CHANGE
      if (newStatus === 'published') {
        notifyProjectPublished(updatedProject);
      } else if (newStatus === 'archived') {
        notifyProjectDeleted(updatedProject, false); // false = soft delete (archive)
      } else if (newStatus === 'draft' && previousProject.status === 'published') {
        notifyProjectUnpublished(updatedProject);
      }
      
      // ✅ Success - show toast and refresh from server
      const successMessage = newStatus === 'published' ? 'Project is now LIVE!' : 
                           newStatus === 'archived' ? 'Project archived' :
                           'Project updated';
      showToast(successMessage, 'success');
      
      // ✅ Refresh project data from server
      if (onRefreshProject) {
        setTimeout(() => {
          onRefreshProject();
        }, 3000);
      }

    } catch (error) {
      console.error('Status error:', error);
      // ✅ Revert on error
      updateProject(previousProject);
      
      if (error.message === 'AUTH_EXPIRED') {
        if (triggerError) triggerError();
      } else {
        showToast('Failed to update status', 'error');
      }
    } finally {
      setLoading(false);
    }
};

  // ✅ Archive confirmation handler with re-validation
  const confirmArchive = async () => {
    setShowArchiveModal(false);
    
    // ✅ Validate session again (in case modal was open for a while)
    console.log('🔐 Re-validating session for archive confirmation...');
    if (!(await validateSession())) {
      console.log('❌ Session validation failed during confirmation');
      return;
    }

    // Get fresh session for the actual operation
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error || !sessionData.session) {
        if (triggerError) triggerError();
        return;
      }
      
      await executeStatusChange('archived', sessionData.session);
    } catch (error) {
      console.error('❌ Archive confirmation failed:', error);
      if (triggerError) triggerError();
    }
  };

  // ✅ Archive button click handler
  const handleArchiveClick = () => {
    setShowArchiveModal(true);
  };

  // ✅ Delete trigger - opens confirmation modal
  const requestDelete = () => {
      setShowDeleteModal(true);
      setDeleteConfirmation(""); // Reset input
  };

  // ✅ Delete confirmation with validation
const confirmDelete = async () => {
    if (deleteConfirmation !== project.title) return;
    setShowDeleteModal(false); // Close modal
    setLoading(true); // Start loading UI on main screen
    try {
      const token = await getAuthToken(); // ✅ Get fresh token

      const res = await fetch(`/api/projects/delete?id=${project.id}&hard=true&confirmTitle=${encodeURIComponent(project.title)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
          if (res.status === 401) throw new Error("AUTH_EXPIRED");
          throw new Error('Deletion failed');
      }

      // ✅ ADD HARD DELETE NOTIFICATION
      notifyProjectDeleted(project, true); // true = hard delete

      showToast('Project deleted permanently', 'success');
      const safeUsername = user?.user_metadata?.username || 'user';
      router.push(`/${safeUsername}/dashboard`);
    } catch (error) {
        console.error('Delete error:', error);
        if (error.message === "AUTH_EXPIRED") {
            if (triggerError) triggerError();
        } else {
            showToast('Failed to delete project', 'error');
        }
    } finally {
        setLoading(false);
    }
};

  // ✅ UI helpers - status color configuration
  const statusColors = {
    draft: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    published: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    archived: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
    banned: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  };
  const currentStatus = statusColors[project.status] || statusColors.draft;

  return (
    <div className="animate-in fade-in duration-500">
        
        {/* Breadcrumb / Header */}
        <div className="mb-8">
            <Link href={`/${user?.user_metadata?.username || 'user'}/dashboard`} className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-widest group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Forge
            </Link>

            {/* ✅ UPDATED: Banned Project Overlay (no export) */}
{project.status === 'banned' && (
  <div className="mb-6 bg-red-950/50 backdrop-blur-xl border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 animate-in fade-in slide-in-from-top-4 duration-500">
    <div className="p-8 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-linear-to-br from-red-500/30 via-transparent to-red-900/30" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Icon */}
        <div className="p-6 bg-red-500/20 rounded-2xl border border-red-500/30 shadow-lg shadow-red-500/10 shrink-0">
          <AlertTriangle size={48} className="text-red-400" />
        </div>

        {/* Message */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-3xl font-black uppercase tracking-tight text-red-400">
              🚫 Project Banned
            </h3>
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-bold uppercase text-red-400">
              Pending Deletion
            </span>
          </div>
          
          <p className="text-red-300/90 mb-4 leading-relaxed">
            This project violated platform guidelines and is queued for permanent deletion. 
            All data will be removed within 30 days.
          </p>

          {/* Timeline */}
          <div className="flex items-center gap-4 text-sm text-red-400/70 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Banned: {new Date(project.updated_at).toLocaleDateString()}</span>
            </div>
            <span className="text-red-500/30">•</span>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>Deletion: Within 30 days</span>
            </div>
          </div>

          {/* Contact Support Button */}
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-red-900/20"
          >
            <ShieldAlert size={16} />
            Contact Support
          </a>
          
          <p className="text-xs text-red-400/60 mt-3">
            If you believe this is an error, contact support immediately.
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-red-500/50 rounded-full animate-ping"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-red-900/50 rounded-full animate-pulse delay-500"></div>
    </div>
  </div>
)}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-[#161b2c]/50 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-28 bg-black rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-2xl relative group">
                        {project.cover_url ? (
                            <img src={project.cover_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700"><Eye size={24} /></div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-white">{project.title}</h1>
                        <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-400 items-center">
                            <span className={`${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} px-2 py-0.5 rounded border uppercase font-bold tracking-wider`}>
                                {project.status}
                            </span>
                            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">v{project.version || '1.0'}</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{project.platform || 'Multi'}</span>
                        </div>
                    </div>
                </div>

                <AdminCommentBanner />
                
<div className="flex flex-wrap gap-3">
    {/* ✅ Session Status Indicator */}
    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
      sessionStatus === 'valid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
      sessionStatus === 'expired' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        sessionStatus === 'valid' ? 'bg-emerald-500 animate-pulse' :
        sessionStatus === 'expired' ? 'bg-red-500 animate-ping' :
        'bg-amber-500 animate-pulse'
      }`}></span>
      {sessionStatus === 'valid' ? 'CONNECTED' : sessionStatus === 'expired' ? 'DISCONNECTED' : 'CHECKING'}
    </div>

    {/* ✅ Preview Button - Always Show if draft */}
    {project.status === 'draft' && (
    <a 
      href={`/${user?.user_metadata?.username}/dashboard/project/${project.id}/preview`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-slate-700 hover:bg-slate-600 border border-slate-600/50 px-5 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all hover:text-white text-slate-300"
    >
      <Eye size={16} /> Preview
    </a>
    )}

    {/* ✅ Public Page - Only for Published */}
    {project.status === 'published' && (
        <a 
          href={`/view/${project.slug}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all hover:text-white text-slate-300"
        >
            <Globe size={16} /> Public Page
        </a>
    )}
    
    {/* ✅ Action Buttons */}
    {project.status === 'draft' ? (
        <button 
            onClick={() => handleStatusChange('published')}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 shadow-lg hover:shadow-emerald-900/20 transition-all disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
            Publish Now
        </button>
    ) : (
        <button 
            onClick={() => router.refresh()}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all hover:text-white text-slate-300"
        >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync
        </button>
    )}
</div>
            </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatBox label="Total Views" value="--" icon={Eye} color="blue" />
            <StatBox label="Downloads" value="--" icon={Download} color="emerald" />
            <StatBox label="Rating" value="--" icon={BarChart3} color="amber" />
            <StatBox label="Reports" value="--" icon={ShieldAlert} color="red" />
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Card 1: Edit Details */}
           <button 
                onClick={() => router.push(`/${user?.user_metadata?.username || 'user'}/dashboard/project/${project.id}/edit`)} 
                className="group p-8 rounded-2xl bg-[#161b2c] border border-white/5 hover:border-emerald-500/50 transition-all text-left hover:-translate-y-1 shadow-lg relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Edit size={32} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2 text-white relative z-10">Edit Metadata</h3>
              <p className="text-slate-400 text-sm relative z-10">Update description, tags, media, and download links.</p>
           </button>

           {/* Card 2: Status Management - Enhanced */}
           <div className="group p-8 rounded-2xl bg-[#161b2c] border border-white/5 hover:border-blue-500/50 transition-all text-left hover:-translate-y-1 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <Archive size={32} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform relative z-10" />
                <h3 className="text-xl font-bold uppercase tracking-wide mb-2 text-white relative z-10">Availability</h3>
                <p className="text-slate-400 text-sm relative z-10 mb-4">Control public access to your project.</p>
              </div>
              
              <div className="relative z-10 space-y-3">
                {/* Current Status Display */}
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
                  <span className={`${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} px-2 py-1 rounded border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.text.replace('text-', 'bg-')} animate-pulse`}></span>
                    {project.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {project.status === 'published' && (
                    <button 
                      onClick={handleArchiveClick}
                      disabled={loading}
                      className="w-full group/btn relative overflow-hidden bg-linear-to-r from-slate-600/20 to-blue-600/20 hover:from-slate-600/30 hover:to-blue-600/30 border border-slate-500/30 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-900/20"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Archive size={16} className="group-hover/btn:rotate-12 transition-transform" />
                      )}
                      <span className="relative z-10">Archive Project</span>
                    </button>
                  )}
                  
                  {project.status === 'archived' && (
                    <button 
                      onClick={() => handleStatusChange('published')}
                      disabled={loading}
                      className="w-full group/btn relative overflow-hidden bg-linear-to-r from-emerald-600/20 to-green-600/20 hover:from-emerald-600/30 hover:to-green-600/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-emerald-400 px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-900/20"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Rocket size={16} className="group-hover/btn:-rotate-12 transition-transform" />
                      )}
                      <span className="relative z-10">Re-Publish</span>
                    </button>
                  )}
                  
                  {project.status === 'draft' && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-xs text-amber-400 italic text-center flex items-center justify-center gap-2">
                        <Edit size={14} />
                        Publish using the button in the header.
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Info */}
                <div className="text-[10px] text-slate-500 text-center space-y-1">
                  {project.status === 'published' && (
                    <p className="flex items-center justify-center gap-1">
                      <Globe size={10} />
                      Visible in public feed
                    </p>
                  )}
                  {project.status === 'archived' && (
                    <p className="flex items-center justify-center gap-1">
                      <Archive size={10} />
                      Hidden from public feed
                    </p>
                  )}
                  {project.status === 'draft' && (
                    <p className="flex items-center justify-center gap-1">
                      <Edit size={10} />
                      Private development mode
                    </p>
                  )}
                </div>
              </div>
           </div>

           {/* Card 3: Danger Zone */}
           <button 
                onClick={requestDelete}
                disabled={loading}
                className="group p-8 rounded-2xl bg-[#161b2c] border border-white/5 hover:border-red-500/50 transition-all text-left hover:-translate-y-1 shadow-lg relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShieldAlert size={32} className="text-red-500 mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2 text-white relative z-10">Danger Zone</h3>
              <p className="text-slate-400 text-sm relative z-10">Permanently delete this project and all assets.</p>
           </button>

        </div>

      {/* SESSION ERROR OVERLAY */}
      {showSessionError && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Link Severed</h3>
                <p className="text-slate-400 mb-8 text-sm">Your security token has expired. Re-initialization required.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                    <RefreshCw size={18} /> Reconnect
                </button>
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Warning Header */}
                <div className="flex items-center gap-4 mb-6 text-red-500">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 animate-pulse">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Permanent Delete</h3>
                </div>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    This action <strong className="text-red-400">cannot be undone</strong>. All data, assets, and analytics for <span className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded">{project.title}</span> will be erased from the network.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-2">
                            Type project title to confirm
                        </label>
                        <input 
                            type="text" 
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder={project.title}
                            className="w-full bg-black/50 border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none placeholder:text-slate-700 transition-all font-mono text-sm"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-bold uppercase text-xs tracking-wider transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={deleteConfirmation !== project.title}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-black uppercase text-xs tracking-wider transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} /> Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#161b2c] border border-blue-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-transparent to-slate-500/20" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="p-4 bg-linear-to-br from-blue-500/20 to-slate-500/20 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Archive size={32} className="text-blue-400 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Archive Project</h3>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Status Change Required</p>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Project Info Card */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-black rounded-lg overflow-hidden border border-white/10 shrink-0">
                    {project.cover_url ? (
                      <img src={project.cover_url} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                        <Eye size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{project.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE
                      </span>
                      <span className="text-xs text-slate-500">→</span>
                      <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        ARCHIVED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <AlertTriangle size={16} />
                  <span>Archive Effects</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 ml-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    Project will be hidden from public feed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    Direct links will return a 404 error
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    Can be re-published anytime
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowArchiveModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white font-bold uppercase text-xs tracking-wider transition-all border border-white/5 hover:border-white/10 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative z-10">Keep Live</span>
                </button>
                
                <button 
                  onClick={confirmArchive}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-slate-600 hover:from-blue-500 hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-black uppercase text-xs tracking-wider transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  {loading ? (
                    <Loader2 className="animate-spin relative z-10" size={16} />
                  ) : (
                    <Archive size={16} className="relative z-10 group-hover:rotate-12 transition-transform" />
                  )}
                  <span className="relative z-10">Archive Now</span>
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500/50 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 left-4 w-1 h-1 bg-slate-500/50 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ================================================================
 * STAT BOX COMPONENT - Displays project statistics
 * ================================================================
 */
function StatBox({ label, value, icon: Icon, color = "emerald" }) {
    const styles = {
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        red: "text-red-500 bg-red-500/10 border-red-500/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    };
    const style = styles[color] || styles.emerald;

    return (
        <div className="bg-[#161b2c] border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors group">
            <div className={`p-3 rounded-lg border ${style} transition-transform group-hover:scale-110`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-2xl font-black text-white leading-none tracking-tight">{value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
    );
}