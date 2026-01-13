/**
 * 💎 RUBIES UNLEASHED - Auth Guard Proxy (Phase 4)
 * ------------------------------------------------
 * Protects authenticated routes and handles redirects.
 * Updated for Next.js 15+ proxy convention.
 */

import { NextResponse } from 'next/server';

export async function proxy(req) {
  try {
    const { pathname } = req.nextUrl;
    
    // ✅ DEBUG LOGGING (remove in production)
    console.log(`🔍 Proxy checking: ${pathname}`);
    
    // Define protected path patterns
    const protectedPatterns = [
      /^\/[^\/]+\/project\//, // /username/project/* (edit routes)
    ];
    // Note: Removed /dashboard, /publish, /settings - they handle auth at component level
    
    // Check if current path is protected
    const isProtectedRoute = protectedPatterns.some(pattern => {
      const matches = pattern.test(pathname);
      console.log(`🔍 Pattern ${pattern} matches ${pathname}: ${matches}`);
      return matches;
    });
    
    console.log(`🔍 Is protected route: ${isProtectedRoute}`);
    
    // If route is not protected, allow it through
    if (!isProtectedRoute) {
      console.log(`✅ Allowing unprotected route: ${pathname}`);
      return NextResponse.next();
    }
    
    // For protected routes, check for auth token in cookies
    const authToken = req.cookies.get('sb-access-token')?.value || 
                     req.cookies.get('supabase-auth-token')?.value ||
                     req.cookies.get('sb-auth-token')?.value;
    
    console.log(`🔍 Auth token found: ${authToken ? 'YES' : 'NO'}`);
    
    // If no auth token found, redirect to login
    if (!authToken) {
      console.log(`🔒 Blocking unauthenticated access to: ${pathname}`);
      
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
    
    console.log(`✅ Allowing authenticated access to: ${pathname}`);
    
    // For project routes, we'll do username verification on the page level
    // (since we need full Supabase client for database queries)
    
    // Allow authenticated requests to proceed
    return NextResponse.next();
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    // On error, allow request to proceed
    // (Let the page handle auth state)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};