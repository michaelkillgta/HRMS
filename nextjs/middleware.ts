import { NextResponse, NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'hrms_session_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, Next internals, public assets, and auth APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/faceapi') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest'
  ) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // If visiting login page
  if (pathname === '/login') {
    if (sessionToken) {
      // Already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // If not logged in, redirect to login page
  if (!sessionToken) {
    // If it's an API request, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
