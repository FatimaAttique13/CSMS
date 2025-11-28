import PlaceOrder from '@/components/PlaceOrder';
import RequireAuth from '@/components/RequireAuth';

export const metadata = {
  title: 'Place Order - CSMS',
  description: 'Place a new cement order'
};

export default function PlaceOrderPage() {
  return (
    <RequireAuth>
      <PlaceOrder />
    </RequireAuth>
  );
}
