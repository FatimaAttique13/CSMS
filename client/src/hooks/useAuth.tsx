'use client';

import React from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to replace the old AuthContext
 * This provides the same interface but uses Clerk under the hood
 */
export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Map Clerk user to your old user format
  const mappedUser = user ? {
    email: user.primaryEmailAddress?.emailAddress || '',
    role: user.publicMetadata?.role as 'customer' | 'admin' || 'customer',
    name: user.fullName || user.firstName || user.username || 'User',
    id: user.id,
  } : null;

  const logout = async () => {
    await signOut();
    router.push('/login');
  };

  // These functions are no longer needed with Clerk, but keeping for compatibility
  const login = async () => {
    throw new Error('Use Clerk SignIn component instead');
  };

  const signup = async () => {
    throw new Error('Use Clerk SignUp component instead');
  };

  return {
    user: mappedUser,
    role: mappedUser?.role,
    loading: !isLoaded,
    isAuthenticated: isSignedIn || false,
    login,
    signup,
    logout,
  };
}

/**
 * HOC to protect routes - require authentication
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}

/**
 * HOC to require admin role
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/login');
      } else if (user?.publicMetadata?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn || user?.publicMetadata?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
