'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Factory, Mail, Lock, UserPlus, CheckCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signup({ email: form.email, password: form.password });
      
      // Show success message
      setSuccess(true);
      
      // Don't auto-redirect - user needs to verify email first
      // Clear form
      setForm({ email: '', password: '', confirm: '' });
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success state UI
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16 font-sans">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Check Your Email!</h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              We've sent a verification link to <strong>{form.email || 'your email'}</strong>. 
              Please click the link to verify your account before logging in.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium">
                💡 Tip: Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-block w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16 font-sans">
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
          <h2 className="text-4xl font-black text-gray-900 leading-tight">Create Account</h2>
          <p className="text-gray-600 text-lg font-medium leading-relaxed">Join the platform for a smarter, faster, and more transparent construction material supply workflow.</p>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 font-black flex items-center justify-center">1</span>
              <p className="text-gray-600 font-medium">Track orders in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 font-black flex items-center justify-center">2</span>
              <p className="text-gray-600 font-medium">Access detailed analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 font-black flex items-center justify-center">3</span>
              <p className="text-gray-600 font-medium">Secure account management</p>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 w-full">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Sign Up</h2>
          <p className="text-gray-600 mb-8 font-medium">Create your account to continue</p>
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
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password *</label>
              <div className="flex items-center border-2 border-gray-200 rounded-2xl p-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
                <Lock className="h-5 w-5 text-gray-400 mr-3" />
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required placeholder="••••••••" className="flex-1 outline-none" />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition-all shadow-lg ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02]'}`}>
              <UserPlus className="h-5 w-5" /> {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-8 font-medium text-center">Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
