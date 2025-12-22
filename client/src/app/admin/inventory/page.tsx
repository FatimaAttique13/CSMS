'use client';

import Inventory from '@/admin/Inventory';
import RequireAuth from '@/components/RequireAuth';

export default function InventoryPage() {
  return (
    <RequireAuth roles={['admin']}>
      <Inventory />
    </RequireAuth>
  );
}
