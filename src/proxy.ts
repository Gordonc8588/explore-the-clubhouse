import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to the login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Require a valid admin session — check the cookie's value, not just its
  // presence (an expired/blank cookie should not count as authenticated).
  const adminSession = request.cookies.get('admin-session')
  if (adminSession?.value !== 'authenticated') {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated: refresh the session cookie so active admins aren't logged
  // out mid-task (sliding expiry). Keep these attributes in sync with the
  // cookie set in src/app/api/admin/login/route.ts.
  const response = NextResponse.next()
  response.cookies.set('admin-session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}

export const config = {
  matcher: '/admin/:path*',
}
