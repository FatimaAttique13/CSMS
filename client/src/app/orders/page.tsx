import OrderHistory from '@/components/OrderHistory';
import RequireAuth from '@/components/RequireAuth';

export const metadata = {
  title: 'Order History - CSMS',
  description: 'View your order history'
};

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrderHistory />
    </RequireAuth>
  );
}
