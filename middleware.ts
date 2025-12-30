import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session so it's available for the Browser and Server Components
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isAuthPage = pathname === '/';

  // Define all routes that require a logged-in user
  const protectedRoutes = [
    '/dashboard',
    '/finance',
    '/goals',
    '/lists',       // This covers /lists and /lists/[id]
    '/bpd-tracker'
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // 1. Redirect to home if accessing a protected route without a session
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/', req.url);
    // Optional: store the attempted URL to redirect back after login
    // redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Redirect to dashboard if logged in and trying to access the login/home page
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// The matcher ensures middleware runs on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};