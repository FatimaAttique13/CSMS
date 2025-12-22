'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/*
  Wrap protected routes in Next.js:
  This component should be used in page.tsx files to protect routes
*/
export default function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      console.log('[RequireAuth] Auth check:', {
        isAuthenticated,
        role,
        requiredRoles: roles,
        pathname,
        roleType: typeof role
      });
      
      if (!isAuthenticated) {
        console.log('[RequireAuth] Not authenticated, redirecting to login');
        // Redirect to login, storing the intended destination
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      } else if (roles && roles.length > 0 && !roles.includes(role)) {
        console.log('[RequireAuth] Role mismatch! User role:', role, 'Required:', roles);
        // Redirect unauthorized users (e.g., customer hitting admin page)
        const redirectPath = role === 'admin' ? '/admin/analytics' : '/';
        console.log('[RequireAuth] Redirecting to:', redirectPath);
        router.push(redirectPath);
      } else {
        console.log('[RequireAuth] Access granted!');
      }
    }
  }, [isAuthenticated, role, loading, roles, router, pathname]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 font-semibold">
        Checking access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 font-semibold">
        Redirecting to login...
      </div>
    );
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 font-semibold">
        Redirecting...
      </div>
    );
  }

  return children;
}
