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
    
    console.log(`🔍 Proxy checking: ${pathname}`);
    
    // ✅ CRITICAL: Exclude password recovery routes entirely
    const publicRoutes = [
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password', // ✅ ADD: Allow password recovery
      '/explore',
      '/view',
      '/about',
      '/help',
      '/contact',
      '/privacy',
      '/terms',
      '/status',
      '/publish',
    ];
    
    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    if (isPublicRoute) {
      console.log(`✅ Allowing public route: ${pathname}`);
      return NextResponse.next();
    }
    
    // Define protected path patterns (creator dashboard routes)
    const protectedPatterns = [
      /^\/[^\/]+\/dashboard\/project\/[^\/]+\/edit/, // Edit routes
      /^\/[^\/]+\/dashboard\/project\/[^\/]+\/preview/, // Preview routes
      /^\/[^\/]+\/dashboard/, // All dashboard routes
      /^\/settings/, // Settings page
      /^\/admin/, // Admin routes
    ];
    
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
    const allCookies = req.cookies.getAll();
    const authCookie = allCookies.find(c => 
      c.name.includes('sb-') && c.name.includes('auth-token')
    );
    
    console.log(`🍪 Total cookies: ${allCookies.length}`);
    console.log(`🍪 Cookie names:`, allCookies.map(c => c.name).join(', '));
    console.log(`🔍 Auth token found: ${authCookie ? authCookie.name : 'NO'}`);
    
    // If no auth token found, redirect to login
    if (!authCookie) {
      console.log(`🔒 Blocking unauthenticated access to: ${pathname}`);
      
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
    
    console.log(`✅ Allowing authenticated access to: ${pathname}`);
    
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