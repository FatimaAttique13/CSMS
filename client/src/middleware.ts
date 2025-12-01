import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api/auth/login',
  '/api/auth/signup',
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes - require authentication
  await auth.protect();

  // For admin routes, you can add additional role checks here
  // This would require setting up user metadata in Clerk dashboard
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth();
    
    // Check if user has admin role (you need to set this in Clerk metadata)
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    
    if (role !== 'admin') {
      // Redirect non-admin users trying to access admin routes
      return Response.redirect(new URL('/dashboard', request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
