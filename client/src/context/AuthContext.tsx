import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/*
  Simple client-side auth (placeholder):
  - Persists user in localStorage { email, role }
  - Roles: 'customer' | 'admin'
  - In real integration replace with API + secure tokens
*/
type User = {
  _id?: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
};

type AuthContextValue = {
  user: User | null;
  role?: User['role'];
  loading: boolean;
  login: (creds: { email: string; password: string }) => Promise<User>;
  signup: (creds: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // { email, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('csms_user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<User> => {
    if (!email || !password) {
      throw new Error('Missing credentials');
    }

    try {
      // Call the actual API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw error with response data for better error handling
        const error: any = new Error(data.error || 'Login failed');
        error.response = { data, status: response.status };
        throw error;
      }

      // Extract user data from API response
      const u: User = { 
        email: data.email, 
        role: data.role as User['role'],
        name: data.fullName || data.profile?.firstName || email.split('@')[0]
      };
      
      localStorage.setItem('csms_user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (error) {
      // Re-throw to be caught by Login component
      throw error;
    }
  }, []);

  const signup = useCallback(async ({ email, password }: { email: string; password: string }): Promise<User> => {
    if (!email || !password) {
      throw new Error('Missing credentials');
    }

    try {
      // Call the actual API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const error: any = new Error(data.error || 'Signup failed');
        error.response = { data, status: response.status };
        throw error;
      }

      // Extract user data from API response
      const u: User = { 
        _id: data.user?._id || data._id,
        email: data.user?.email || data.email, 
        role: (data.user?.role || data.role) as User['role'],
        name: data.user?.fullName || data.fullName || data.user?.profile?.firstName || data.profile?.firstName || email.split('@')[0]
      };
      
      localStorage.setItem('csms_user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('csms_user');
    setUser(null);
  }, []);

  const value: AuthContextValue = { user, role: user?.role, loading, login, signup, logout, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
