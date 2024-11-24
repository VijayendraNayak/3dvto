import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Retrieve cookies
  const loggedIn = request.cookies.get('loggedin')?.value;
  const role = request.cookies.get('role')?.value;
  const url = request.nextUrl.clone();


  // Public routes that don't require authentication
  const publicRoutes: string[] = ['/', '/login', '/register'];

  // Strictly check public routes (exact matches only)
  if (publicRoutes.includes(url.pathname)) {
    console.log('Public route, allowing access');
    return NextResponse.next();
  }

  // Check if the user is logged in
  if (!loggedIn || loggedIn !== 'true') {
    console.log('User not logged in, redirecting to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (url.pathname.startsWith('/profile') && role !== 'user'&& role!=="admin") {
    console.log('Unauthorized access to /profile, redirecting to /unauthorized');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (url.pathname.startsWith('/admin') && role !== 'admin') {
    console.log('Unauthorized access to /admin, redirecting to /unauthorized');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // If all checks pass, allow access
  console.log('Access granted to:', url.pathname);
  return NextResponse.next();
}

// Configure the routes to match
export const config = {
  matcher: [
    '/',               // Include root route
    '/profile',        // Profile page
    '/admin/:path*',   // Admin routes with wildcard
    '/cart',           // Cart route
  ],
};
