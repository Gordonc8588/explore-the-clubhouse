import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin-session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to the login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Require a valid, signed admin session token (not just a present cookie).
  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)
  if (!verifyAdminSessionToken(adminSession?.value)) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
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
  matcher: '/admin/:path*',
}
