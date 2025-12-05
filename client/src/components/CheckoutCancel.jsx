'use client';

import React from 'react';
import Link from 'next/link';

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8 text-center">
      <h1 className="text-4xl font-black text-red-600 mb-4">Payment Cancelled</h1>
      <p className="text-gray-700 mb-6">You can review your order and try again when ready.</p>
      <Link href="/orders/place" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-800">Return to Order</Link>
    </div>
  );
};

export default CheckoutCancel;
