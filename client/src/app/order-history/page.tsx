'use client';

import OrderHistory from '@/components/OrderHistory';
import RequireAuth from '@/components/RequireAuth';

export default function OrderHistoryPage() {
  return (
    <RequireAuth roles={['customer'] as any}>
      <OrderHistory />
    </RequireAuth>
  );
}
