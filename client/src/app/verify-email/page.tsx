'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async (verificationToken: string) => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          if (data.user?.email) {
            setUserEmail(data.user.email);
          }
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
      }
    };

    verifyEmail(token);
  }, [token, router]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification email sent! Please check your inbox.');
        setResendEmail('');
      } else {
        alert(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      alert('Failed to send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verification</h1>
          <p className="text-gray-600">CSMS - Construction Supply Management</p>
        </div>

        {/* Status Display */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Email Verified! 🎉</h2>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-800 font-semibold mb-2">{message}</p>
                {userEmail && (
                  <p className="text-green-700 text-sm">
                    Account: <span className="font-mono font-semibold">{userEmail}</span>
                  </p>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  ✨ Your account is now active and ready to use!
                </p>
              </div>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
            </div>
          )}
        </div>

        {/* Resend Email Form (shown on error) */}
        {status === 'error' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request New Verification Link</h3>
            <form onSubmit={handleResendEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Link 
            href="/login"
            className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          >
            Go to Login
          </Link>
          <Link 
            href="/"
            className="block w-full text-center text-blue-600 hover:text-blue-700 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
