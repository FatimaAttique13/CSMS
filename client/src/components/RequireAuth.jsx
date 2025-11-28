'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
      if (!isAuthenticated) {
        // Redirect to login, storing the intended destination
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      } else if (roles && roles.length > 0 && !roles.includes(role)) {
        // Redirect unauthorized users (e.g., customer hitting admin page)
        const redirectPath = role === 'admin' ? '/admin/analytics' : '/';
        router.push(redirectPath);
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
