'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Factory, Mail, Lock, UserPlus } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const u = await signup({ email: form.email, password: form.password });
      if (u.role === 'admin') {
        router.replace('/admin/analytics');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-4xl font-black text-gray-900 leading-tight">Create Account</h2>
          <p className="text-gray-600 text-lg font-medium leading-relaxed">Join the platform for a smarter, faster, and more transparent construction material supply workflow.</p>
          <ul className="space-y-3 text-sm font-medium text-gray-600">
            <li className="flex gap-3 items-start"><span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-xs">✓</span> Demo admin: admin@gmail.com / admin</li>
            <li className="flex gap-3 items-start"><span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-xs">✓</span> Access order tracking & analytics</li>
            <li className="flex gap-3 items-start"><span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-xs">✓</span> Secure session stored locally (demo)</li>
          </ul>
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
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password *</label>
              <div className="flex items-center border-2 border-gray-200 rounded-2xl p-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
                <Lock className="h-5 w-5 text-gray-400 mr-3" />
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required placeholder="••••••••" className="flex-1 outline-none" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition-all shadow-lg ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02]'}`}>
              <UserPlus className="h-5 w-5" /> {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-8 font-medium text-center">Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login</Link></p>
          <p className="text-[11px] text-gray-400 mt-6 text-center">Demo only: Replace with secure backend auth in production.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
