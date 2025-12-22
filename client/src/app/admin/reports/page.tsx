'use client';

import AdminReports from '@/admin/AdminReports';
import RequireAuth from '@/components/RequireAuth';

export default function AdminReportsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminReports />
    </RequireAuth>
  );
}
