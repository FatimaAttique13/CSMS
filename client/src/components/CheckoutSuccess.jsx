'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CheckoutSuccess = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8 text-center">
      <h1 className="text-4xl font-black text-green-700 mb-4">Payment Successful</h1>
      <p className="text-gray-700 mb-6">Your order has been confirmed. Session: {sessionId || 'N/A'}</p>
      <Link href="/order-history" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-800">View Orders</Link>
    </div>
  );
};

export default CheckoutSuccess;
