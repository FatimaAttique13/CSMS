import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
];

// Define admin routes that require admin role
const adminRoutes = [
  '/admin',
  '/api/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication (user stored in localStorage on client side)
  // Note: Middleware runs on server, so we can't check localStorage here
  // The actual auth check will be done client-side in RequireAuth component
  // This middleware is mainly for API route protection

  // For API routes, check for authentication
  if (pathname.startsWith('/api/')) {
    // You can add token-based authentication here if needed
    // For now, let the API routes handle their own auth
    return NextResponse.next();
  }

  // Check if the route requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminRoute) {
    // Admin check will be done client-side in RequireAuth component
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
