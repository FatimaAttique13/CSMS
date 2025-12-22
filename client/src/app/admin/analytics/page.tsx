'use client';

import AdminAnalytics from '@/admin/AdminAnalytics';
import RequireAuth from '@/components/RequireAuth';

export default function AdminAnalyticsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminAnalytics />
    </RequireAuth>
  );
}
