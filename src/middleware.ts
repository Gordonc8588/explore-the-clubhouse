import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to the login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for admin session cookie
  const adminSession = request.cookies.get('admin-session')

  // If no session, redirect to login
  if (!adminSession) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Allow authenticated users to proceed
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
