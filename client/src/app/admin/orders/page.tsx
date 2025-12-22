'use client';

import AdminOrders from '@/admin/AdminOrders';
import RequireAuth from '@/components/RequireAuth';

export default function AdminOrdersPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminOrders />
    </RequireAuth>
  );
}
