'use client';

import AdminInvoices from '@/admin/AdminInvoices';
import RequireAuth from '@/components/RequireAuth';

export default function AdminInvoicesPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminInvoices />
    </RequireAuth>
  );
}
