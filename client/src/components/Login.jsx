'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Factory, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(form);
      // Admin users go to admin analytics
      if (loggedInUser.role === 'admin') {
        router.replace('/admin/analytics');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      // Check for specific error types
      if (err.response?.data?.errorType === 'USER_NOT_FOUND') {
        // User doesn't exist - redirect to signup for non-admin
        setError('No account found with this email. Redirecting to signup...');
        setTimeout(() => {
          router.push('/signup');
        }, 2000);
      } else if (err.response?.data?.errorType === 'INVALID_PASSWORD') {
        // Invalid password
        setError('Invalid password. Please try again.');
      } else if (err.response?.data?.errorType === 'ACCOUNT_DISABLED') {
        setError('Your account has been disabled. Please contact support.');
      } else {
        // Generic error
        setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, auto-redirect away from login
  useEffect(() => {
    if (user) {
      router.replace(user.role === 'admin' ? '/admin/analytics' : '/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-gray-100 flex items-center justify-center px-6 py-16 font-sans">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Left Branding Panel */}
        <div className="hidden lg:flex flex-col gap-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-3 rounded-2xl shadow-lg">
              <Factory className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-none">CSMS</h1>
              <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Supply Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 leading-tight">Welcome Back</h2>
          <p className="text-gray-600 text-lg font-medium leading-relaxed">Access your dashboard to track orders, manage deliveries, and optimize your material supply chain with real-time insights.</p>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 font-black flex items-center justify-center">1</span>
              <p className="text-gray-600 font-medium">Secure role-based access</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 font-black flex items-center justify-center">2</span>
              <p className="text-gray-600 font-medium">Real-time order analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 font-black flex items-center justify-center">3</span>
              <p className="text-gray-600 font-medium">Streamlined delivery tracking</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 w-full">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Login</h2>
          <p className="text-gray-600 mb-8 font-medium">Enter your credentials to continue</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
              <div className="flex items-center border-2 border-gray-200 rounded-2xl p-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="flex-1 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
              <div className="flex items-center border-2 border-gray-200 rounded-2xl p-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
                <Lock className="h-5 w-5 text-gray-400 mr-3" />
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="flex-1 outline-none" />
              </div>
            </div>
            {error && (
              <div className={`p-4 rounded-2xl border-2 ${
                error.includes('Redirecting') 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <p className="text-sm font-semibold flex items-center gap-2">
                  {error.includes('Redirecting') ? '→' : '⚠️'} {error}
                </p>
              </div>
            )}
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition-all shadow-lg ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02]'}`}>
              <LogIn className="h-5 w-5" /> {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-8 font-medium text-center">Don't have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Create one</Link></p>
          <p className="text-[11px] text-gray-400 mt-6 text-center">Demo admin credentials: <span className="font-semibold">admin@csms.com</span> / <span className="font-semibold">admin</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
