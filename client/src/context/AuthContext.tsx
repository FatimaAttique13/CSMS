import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/*
  Client-side auth with JWT tokens:
  - Persists JWT token in localStorage (also stored in httpOnly cookies by server)
  - User data decoded from JWT token
  - Roles: 'customer' | 'admin'
  - Email verification required for login
*/
type User = {
  _id?: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
  emailVerified?: boolean;
};

type AuthContextValue = {
  user: User | null;
  role?: User['role'];
  loading: boolean;
  login: (creds: { email: string; password: string }) => Promise<User>;
  signup: (creds: { email: string; password: string }) => Promise<{ user: User; emailSent: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const raw = localStorage.getItem('csms_user');
    if (raw) {
      try { 
        const parsed = JSON.parse(raw);
        console.log('[AuthContext] Loading user from localStorage:', parsed);
        setUser(parsed);
      } catch { 
        localStorage.removeItem('csms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<User> => {
    if (!email || !password) {
      throw new Error('Missing credentials');
    }

    try {
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const error: any = new Error(data.error || 'Login failed');
        error.response = { data, status: response.status };
        error.errorType = data.errorType;
        throw error;
      }

      // Store JWT token in localStorage (also stored in httpOnly cookie by server)
      if (data.token) {
        localStorage.setItem('csms_token', data.token);
      }

      // Extract user data from API response
      const userData = data.user || data;
      const u: User = { 
        _id: userData._id,
        email: userData.email, 
        role: userData.role as User['role'],
        name: userData.fullName || userData.profile?.firstName || email.split('@')[0],
        emailVerified: userData.emailVerified
      };
      
      console.log('✅ [AuthContext] Login successful - User:', u);
      localStorage.setItem('csms_user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async ({ email, password }: { email: string; password: string }): Promise<{ user: User; emailSent: boolean }> => {
    if (!email || !password) {
      throw new Error('Missing credentials');
    }

    try {
      // Call the signup API endpoint
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

      // Don't auto-login after signup - user needs to verify email first
      const userData = data.user || data;
      const u: User = { 
        _id: userData._id,
        email: userData.email, 
        role: userData.role as User['role'],
        name: userData.fullName || userData.profile?.firstName || email.split('@')[0],
        emailVerified: userData.emailVerified || false
      };
      
      console.log('✅ [AuthContext] Signup successful - Verification email sent to:', u.email);
      
      return { user: u, emailSent: data.emailSent };
    } catch (error) {
      console.error('❌ [AuthContext] Signup error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('csms_user');
    localStorage.removeItem('csms_token');
    setUser(null);
    
    // Also clear the httpOnly cookie by calling logout endpoint
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {
      // Ignore errors on logout
    });
  }, []);

  const value: AuthContextValue = { 
    user, 
    role: user?.role, 
    loading, 
    login, 
    signup, 
    logout, 
    isAuthenticated: !!user 
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
