'use client';

import Link from 'next/link';
import { Eye, Edit, ArrowLeft, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

export default function PreviewBanner({ 
  project, 
  username, 
  isHidden, 
  hiddenReason,
  moderationReason 
}) {
  const [showBanner, setShowBanner] = useState(true);
  
  if (!showBanner) return null;
  
  const statusColors = {
    draft: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
    published: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    banned: 'from-red-500/20 to-red-600/20 border-red-500/30',
    archived: 'from-slate-500/20 to-slate-600/20 border-slate-500/30'
  };
  
  const statusColor = statusColors[project.status] || statusColors.draft;
  
  return (
    <>
      {/* Main Preview Banner */}
      <div className={`fixed top-20 left-0 right-0 z-50 bg-linear-to-r ${statusColor} border-b backdrop-blur-xl shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0">
                <Eye className="text-white" size={18} />
              </div>
              <div>
                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 flex-wrap">
                  🔒 Preview Mode
                  <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] border border-white/20">
                    {project.status.toUpperCase()}
                  </span>
                </p>
                <p className="text-slate-300 text-[10px] md:text-xs mt-0.5">
                  Only you can see this • Last updated {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {project.status !== 'banned' && (
                <Link 
                  href={`/${username}/dashboard/project/${project.id}/edit`}
                  className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg hover:shadow-xl"
                >
                  <Edit size={14} />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              )}
              
              <Link 
                href={`/${username}/dashboard/project/${project.id}`}
                className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Exit</span>
              </Link>
              
              <button
                onClick={() => setShowBanner(false)}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
                title="Hide Banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Alert */}
      {isHidden && (
        <div className="fixed top-40 left-0 right-0 z-40 px-4 md:px-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="max-w-4xl mx-auto bg-linear-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                <AlertTriangle className="text-amber-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-amber-400 font-bold text-sm md:text-base mb-2">
                  ⚠️ Hidden from Public View
                </h3>
                <p className="text-slate-300 text-xs md:text-sm mb-3 break-words">
                  <strong className="text-white">Reason:</strong> {hiddenReason || 'No reason provided'}
                </p>
                <Link 
                  href={`/${username}/dashboard/project/${project.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
                >
                  View in Cockpit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Banned Alert */}
      {project.status === 'banned' && moderationReason && (
        <div className="fixed top-40 left-0 right-0 z-40 px-4 md:px-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="max-w-4xl mx-auto bg-linear-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
                <ShieldAlert className="text-red-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-400 font-bold text-sm md:text-base mb-2">
                  🚫 This Project is Banned
                </h3>
                <p className="text-slate-300 text-xs md:text-sm mb-2 break-words">
                  <strong className="text-white">Reason:</strong> {moderationReason.reason}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4">
                  <span>Banned by: <span className="text-red-400 font-mono">{moderationReason.admin_username}</span></span>
                  <span>•</span>
                  <span>{new Date(moderationReason.created_at).toLocaleDateString()}</span>
                </div>
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}