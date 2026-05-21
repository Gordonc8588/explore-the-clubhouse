import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin-session'

// Auth endpoints that must stay reachable without a valid session.
const PUBLIC_ADMIN_PATHS = new Set([
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // Require a valid, signed admin session token (not just a present cookie).
  // This guards both /admin pages AND /api/admin routes — defence-in-depth on
  // top of each route's own isAdmin() check, so a route that forgets its guard
  // is still not exposed.
  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)
  if (!verifyAdminSessionToken(adminSession?.value)) {
    // API routes get a JSON 401; page routes redirect to the login screen.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Authenticated: re-issue a fresh token so active admins aren't logged out
  // mid-task (sliding expiry). Keep these attributes in sync with the cookie
  // set in src/app/api/admin/login/route.ts.
  const response = NextResponse.next()
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
  })
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
