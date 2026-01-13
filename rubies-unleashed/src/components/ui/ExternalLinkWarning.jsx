'use client';

import { useState } from 'react';
import { AlertTriangle, ExternalLink, Shield, X } from 'lucide-react';

export default function ExternalLinkWarning({ url, onConfirm, onCancel }) {
  if (!url) return null;
  
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = 'Unknown Source';
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
      <div className="bg-[#161b2c] border border-amber-500/30 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-50" />
        
        {/* Header */}
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
            External <span className="text-amber-500">Content</span>
          </h2>
          
          <p className="text-slate-300 mb-4">
            You are about to access external content from:
          </p>
          
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-lg">
              <ExternalLink size={20} />
              <span className="break-all">{domain}</span>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="px-6 pb-6">
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-white mb-2">Safety Guidelines:</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Only access content from sources you trust</li>
                  <li>• Be cautious with downloads and personal info</li>
                  <li>• RUBIES cannot verify external content</li>
                  <li>• Report suspicious links to our team</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl font-medium transition-all border border-slate-600 hover:border-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}