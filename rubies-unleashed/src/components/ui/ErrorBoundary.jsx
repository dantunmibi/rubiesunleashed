'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorDetails = {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    };

    // 🔍 Console logging for debugging
    console.error('🔥 Error Boundary Caught:', errorDetails);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    console.log('🔄 Resetting error boundary...');
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) { 
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Cinematic Error Card */}
            <div className="bg-surface border border-ruby/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(224,17,95,0.15)]">
              {/* Glitch Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-ruby/30 animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-full bg-ruby/10 flex items-center justify-center border border-ruby/30">
                    <AlertTriangle className="w-10 h-10 text-ruby animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title - Cinematic Style */}
              <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight uppercase">
                System Malfunction
              </h1>
              
              <p className="text-center text-ruby font-mono text-sm mb-6">
                ERR_CLIENT_EXCEPTION
              </p>

              {/* User-Friendly Message */}
              <p className="text-center text-slate-400 mb-8 leading-relaxed">
                Something went wrong while loading this page. 
                <br className="hidden sm:block" />
                We've logged the issue and you can try again.
              </p>

              {/* Dev-Only Stack Trace */}
              {isDevelopment && this.state.error && (
                <div className="bg-black/40 rounded-lg p-4 mb-6 border border-ruby/20">
                  <p className="text-xs font-mono text-ruby mb-2">
                    <strong>DEV MODE:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs font-mono text-slate-500">
                      <summary className="cursor-pointer text-slate-400 hover:text-slate-300 mb-2">
                        Component Stack Trace
                      </summary>
                      <pre className="overflow-x-auto whitespace-pre-wrap text-[10px] leading-tight">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons - Cinematic Style */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 group relative flex items-center justify-center gap-2 bg-ruby hover:bg-ruby/80 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <RefreshCw className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Try Again</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold border border-slate-700 hover:border-slate-600 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold border border-slate-700 hover:border-slate-600 transition-all duration-300"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Footer Help Text */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-center text-xs text-slate-500">
                  If this issue persists, contact support at{' '}
                  <a 
                    href="mailto:officialrubiesunleashed@gmail.com" 
                    className="text-ruby hover:underline transition-colors"
                  >
                    officialrubiesunleashed@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;