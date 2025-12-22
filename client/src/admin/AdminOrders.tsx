'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Factory,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Package,
  MapPin,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react';

const STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const statusStyles = (status: string) => {
  switch (status) {
    case STATUS.DELIVERED:
      return 'bg-green-100 text-green-700 border-green-200';
    case STATUS.OUT_FOR_DELIVERY:
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case STATUS.CONFIRMED:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case STATUS.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const Icon =
    status === STATUS.DELIVERED ? CheckCircle :
    status === STATUS.OUT_FOR_DELIVERY ? Truck :
    status === STATUS.CONFIRMED ? CheckCircle :
    status === STATUS.PENDING ? Clock :
    status === STATUS.CANCELLED ? XCircle : Package;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusStyles(status)}`}>
      <Icon className="h-4 w-4 mr-1.5" />
      {status}
    </span>
  );
};

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

const AdminOrders = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (response.ok && data.orders) {
        setOrders(data.orders);
      } else {
        console.error('Failed to fetch orders:', data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'City', 'Status', 'Total (SAR)'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toISOString(),
      o.customer?.email || 'N/A',
      o.deliveryAddress?.city || 'N/A',
      o.status,
      o.total.toFixed(2)
    ]);
    
    const csv = [headers, ...rows]
      .map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <nav className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-full shadow-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-2 sm:p-2.5 rounded-xl shadow-lg">
                  <Factory className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-gray-900">CSMS</span>
                  <p className="text-[10px] sm:text-xs text-black-600 font-semibold">Admin Panel</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-1">
                <Link href="/admin/analytics" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium rounded-full hover:bg-white/40 text-sm">
                  Analytics
                </Link>
                <Link href="/admin/orders" className="px-4 py-2 text-blue-600 font-medium rounded-full bg-white/40 text-sm">
                  Orders
                </Link>
                <Link href="/admin/invoices" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium rounded-full hover:bg-white/40 text-sm">
                  Invoices
                </Link>
                <Link href="/admin/inventory" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium rounded-full hover:bg-white/40 text-sm">
                  Inventory
                </Link>
                <Link href="/admin/reports" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium rounded-full hover:bg-white/40 text-sm">
                  Reports
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/" className="hidden sm:block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg text-sm">
                  Home
                </Link>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-full hover:bg-white/40">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 pt-4 border-t border-white/20">
                <nav className="flex flex-col space-y-2">
                  <Link href="/admin/analytics" className="px-4 py-3 text-gray-800 hover:text-blue-600 font-medium rounded-2xl hover:bg-white/40">
                    Analytics
                  </Link>
                  <Link href="/admin/orders" className="px-4 py-3 text-blue-600 font-medium rounded-2xl bg-white/40">
                    Orders
                  </Link>
                  <Link href="/admin/invoices" className="px-4 py-3 text-gray-800 hover:text-blue-600 font-medium rounded-2xl hover:bg-white/40">
                    Invoices
                  </Link>
                  <Link href="/admin/inventory" className="px-4 py-3 text-gray-800 hover:text-blue-600 font-medium rounded-2xl hover:bg-white/40">
                    Inventory
                  </Link>
                  <Link href="/admin/reports" className="px-4 py-3 text-gray-800 hover:text-blue-600 font-medium rounded-2xl hover:bg-white/40">
                    Reports
                  </Link>
                  <Link href="/" className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-2xl text-center">
                    Home
                  </Link>
                </nav>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Orders Management</h1>
            <p className="text-gray-600 font-medium">View and manage all customer orders</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order number or customer email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value={STATUS.PENDING}>Pending</option>
                  <option value={STATUS.CONFIRMED}>Confirmed</option>
                  <option value={STATUS.OUT_FOR_DELIVERY}>Out for Delivery</option>
                  <option value={STATUS.DELIVERED}>Delivered</option>
                  <option value={STATUS.CANCELLED}>Cancelled</option>
                </select>

                <button
                  onClick={exportCSV}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Order Number</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">City</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.customer?.email || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.deliveryAddress?.city || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">SAR {order.total?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">Total Orders</p>
                  <p className="text-3xl font-black text-gray-900">{filteredOrders.length}</p>
                </div>
                <Package className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">Pending</p>
                  <p className="text-3xl font-black text-yellow-600">
                    {filteredOrders.filter(o => o.status === STATUS.PENDING).length}
                  </p>
                </div>
                <Clock className="h-12 w-12 text-yellow-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">In Transit</p>
                  <p className="text-3xl font-black text-orange-600">
                    {filteredOrders.filter(o => o.status === STATUS.OUT_FOR_DELIVERY).length}
                  </p>
                </div>
                <Truck className="h-12 w-12 text-orange-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">Delivered</p>
                  <p className="text-3xl font-black text-green-600">
                    {filteredOrders.filter(o => o.status === STATUS.DELIVERED).length}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">Order</p>
                  <h2 className="text-2xl font-black text-gray-900">{selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-500">Customer</p>
                    <p className="text-gray-900 font-semibold">{selectedOrder.customer?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-500">Delivery Address</p>
                    <p className="text-gray-900 font-semibold">
                      {selectedOrder.deliveryAddress?.line1}<br />
                      {selectedOrder.deliveryAddress?.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-500">Status</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-lg font-black text-gray-900 mb-4">Items ({selectedOrder.items?.length})</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} {item.unit} × SAR {item.unitPrice}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">SAR {item.lineTotal?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                  <p className="text-lg font-black text-gray-900">Total</p>
                  <p className="text-2xl font-black text-gray-900">SAR {selectedOrder.total?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
