import TrackOrder from '@/components/TrackOrder';
import RequireAuth from '@/components/RequireAuth';

export const metadata = {
  title: 'Track Order - CSMS',
  description: 'Track your cement order status'
};

export default function TrackOrderPage() {
  return (
    <RequireAuth>
      <TrackOrder />
    </RequireAuth>
  );
}
