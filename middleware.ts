import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // This refreshes the session and makes it available to the server
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = req.nextUrl.pathname === '/';
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith('/dashboard') || 
    req.nextUrl.pathname.startsWith('/finance') ||
    req.nextUrl.pathname.startsWith('/goals') ||
    req.nextUrl.pathname.startsWith('/bpd-tracker');

  // If no session and trying to access protected route -> Login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If session exists and trying to access login -> Dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};