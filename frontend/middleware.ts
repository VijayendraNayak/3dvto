import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const secretKey = process.env.SECRET_KEY as string

export function middleware(req: NextRequest) {
  console.log("Middleware running for path:", req.nextUrl.pathname)

  const token = req.cookies.get('authToken')?.value
  const url = req.nextUrl.clone()

  // Public routes (accessible without authentication)
  const publicRoutes = [
    '/login',
    '/register',
    '/',
  ]

  // Check if the current path is a public route
  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (!token) {
    // Redirect to login if not authenticated
    console.log('No token found, redirecting to login')
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', url.pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Decode JWT and verify user
    const decodedToken = jwt.verify(token, secretKey) as { userId: string }

    // Allow access to profile page only for authenticated users
    if (url.pathname.startsWith('/profile')) {
      return NextResponse.next()
    }

    // Redirect non-authenticated users away from protected routes
    if (!decodedToken.userId) {
      console.log('User not authenticated, redirecting')
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/profile',
    '/admin/:path*',
    '/cart/:path*',
  ]
}
