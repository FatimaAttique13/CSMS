import CustomerDashboard from '@/components/CustomerDashboard';
import RequireAuth from '@/components/RequireAuth';

export const metadata = {
  title: 'Dashboard - CSMS',
  description: 'Customer dashboard and overview'
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <CustomerDashboard />
    </RequireAuth>
  );
}
