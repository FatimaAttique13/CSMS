'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Factory,
  Menu,
  X,
  ChevronDown,
  Search,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  RefreshCw,
  Phone,
  Navigation,
  Share2,
  Package,
  Download,
  ArrowRight
} from 'lucide-react';

// Shared status constants/styles (same as other pages)
const STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const statusStyles = (status) => {
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

const formatDate = (iso) => {
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

const stepIndex = (status) => {
  switch (status) {
    case STATUS.PENDING:
      return 1;
    case STATUS.CONFIRMED:
      return 2;
    case STATUS.OUT_FOR_DELIVERY:
      return 3;
    case STATUS.DELIVERED:
      return 4;
    default:
      return 0;
  }
};

const StatusBadge = ({ status }) => {
  const Icon =
    status === STATUS.DELIVERED ? CheckCircle :
    status === STATUS.OUT_FOR_DELIVERY ? Truck :
    status === STATUS.CONFIRMED ? CheckCircle :
    status === STATUS.PENDING ? Clock :
    status === STATUS.CANCELLED ? XCircle : FileText;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusStyles(status)}`}>
      <Icon className="h-4 w-4 mr-1.5" />
      {status}
    </span>
  );
};

const ProgressSteps = ({ status }) => {
  const idx = stepIndex(status); // 1..4
  const steps = [
    { label: 'Placed' },
    { label: 'Confirmed' },
    { label: 'On the way' },
    { label: 'Delivered' }
  ];
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const n = i + 1;
          const active = n <= idx;
          return (
            <div key={s.label} className="flex-1 flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}>
                {n}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${n < idx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
        {steps.map((s) => <div key={s.label}>{s.label}</div>)}
      </div>
    </div>
  );
};

// Helpers specific to tracking
const getETA = (order) => {
  if (!order) return '-';
  switch (order.status) {
    case STATUS.OUT_FOR_DELIVERY:
      return 'Arriving in 45–60 min';
    case STATUS.CONFIRMED: {
      const d = new Date(order.date);
      const slot = new Date(d.getTime() + 2 * 60 * 60 * 1000);
      const slot2 = new Date(d.getTime() + 4 * 60 * 60 * 1000);
      const fmt = (x) => x.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return `${fmt(slot)}–${fmt(slot2)}`;
    }
    case STATUS.PENDING:
      return 'To be scheduled';
    case STATUS.DELIVERED:
      return 'Delivered';
    case STATUS.CANCELLED:
      return '-';
    default:
      return '-';
  }
};

const buildTimeline = (order) => {
  if (!order) return [];
  const base = new Date(order.date); // placed time
  const add = (h) => new Date(base.getTime() + h * 60 * 60 * 1000);

  const events = [
    { key: 'placed', label: 'Order placed', time: base, icon: Clock, done: true },
    { key: 'confirmed', label: 'Order confirmed', time: add(1), icon: CheckCircle, done: [STATUS.CONFIRMED, STATUS.OUT_FOR_DELIVERY, STATUS.DELIVERED].includes(order.status) },
    { key: 'out', label: 'Out for delivery', time: add(2.5), icon: Truck, done: [STATUS.OUT_FOR_DELIVERY, STATUS.DELIVERED].includes(order.status) },
    { key: 'delivered', label: 'Delivered', time: add(4), icon: CheckCircle, done: [STATUS.DELIVERED].includes(order.status) },
  ];

  if (order.status === STATUS.CANCELLED) {
    return [
      events[0],
      { key: 'cancelled', label: 'Order cancelled', time: add(0.5), icon: XCircle, done: true }
    ];
  }

  return events.filter((e, idx) => e.done || idx <= stepIndex(order.status) - 1);
};

const TrackOrder = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // Search / selection
  const [searchId, setSearchId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock orders (same as other pages)
  const orders = useMemo(() => ([
    {
      id: 'ORD-2024-0001',
      date: '2024-09-18T09:45:00Z',
      status: STATUS.DELIVERED,
      city: 'Jeddah',
      address: 'King Abdullah Road, Jeddah 21589',
      notes: 'Deliver to gate 3',
      items: [
        { name: 'Premium Portland Cement', qty: 50, unit: 'bags', unitPrice: 75 },
        { name: 'Coarse Sand', qty: 2, unit: 'tons', unitPrice: 35 }
      ]
    },
    {
      id: 'ORD-2024-0002',
      date: '2024-09-21T14:20:00Z',
      status: STATUS.OUT_FOR_DELIVERY,
      city: 'Makkah',
      address: 'Al Haramain Rd, Makkah 24227',
      notes: '',
      items: [
        { name: 'Crushed Granite 20mm', qty: 12, unit: 'tons', unitPrice: 45 }
      ]
    },
    {
      id: 'ORD-2024-0003',
      date: '2024-10-03T08:05:00Z',
      status: STATUS.CONFIRMED,
      city: 'Jeddah',
      address: 'Site B, Near North Gate',
      notes: 'Call before arrival',
      items: [
        { name: 'Premium Portland Cement', qty: 30, unit: 'bags', unitPrice: 75 },
        { name: 'Coarse Sand', qty: 4, unit: 'tons', unitPrice: 35 }
      ]
    },
    {
      id: 'ORD-2024-0004',
      date: '2024-10-10T16:40:00Z',
      status: STATUS.PENDING,
      city: 'Jeddah',
      address: 'Warehouse 12, Industrial Area',
      notes: '',
      items: [
        { name: 'Crushed Granite 20mm', qty: 5, unit: 'tons', unitPrice: 45 },
        { name: 'Coarse Sand', qty: 3, unit: 'tons', unitPrice: 35 }
      ]
    },
    {
      id: 'ORD-2024-0005',
      date: '2024-08-29T11:10:00Z',
      status: STATUS.CANCELLED,
      city: 'Makkah',
      address: 'Project Alpha, Sector 7',
      notes: 'Client cancelled',
      items: [
        { name: 'Premium Portland Cement', qty: 20, unit: 'bags', unitPrice: 75 }
      ]
    },
    {
      id: 'ORD-2024-0006',
      date: '2024-07-19T10:00:00Z',
      status: STATUS.DELIVERED,
      city: 'Jeddah',
      address: 'King Abdullah Road, Jeddah 21589',
      notes: '',
      items: [
        { name: 'Premium Portland Cement', qty: 60, unit: 'bags', unitPrice: 75 }
      ]
    },
    {
      id: 'ORD-2024-0007',
      date: '2024-10-12T07:55:00Z',
      status: STATUS.DELIVERED,
      city: 'Makkah',
      address: 'Downtown Site C, Gate 2',
      notes: '',
      items: [
        { name: 'Coarse Sand', qty: 6, unit: 'tons', unitPrice: 35 }
      ]
    },
    {
      id: 'ORD-2024-0008',
      date: '2024-09-25T13:30:00Z',
      status: STATUS.CONFIRMED,
      city: 'Jeddah',
      address: 'Al Faisaliyah District, Plot 22',
      notes: 'Unload near storage',
      items: [
        { name: 'Crushed Granite 20mm', qty: 8, unit: 'tons', unitPrice: 45 },
        { name: 'Coarse Sand', qty: 2, unit: 'tons', unitPrice: 35 }
      ]
    },
    {
      id: 'ORD-2024-0009',
      date: '2024-10-15T18:20:00Z',
      status: STATUS.PENDING,
      city: 'Makkah',
      address: 'Site D, East Zone',
      notes: '',
      items: [
        { name: 'Premium Portland Cement', qty: 40, unit: 'bags', unitPrice: 75 }
      ]
    },
    {
      id: 'ORD-2024-0010',
      date: '2024-06-14T09:15:00Z',
      status: STATUS.DELIVERED,
      city: 'Jeddah',
      address: 'Seaside District, Lot 5',
      notes: 'Leave with foreman',
      items: [
        { name: 'Crushed Granite 20mm', qty: 10, unit: 'tons', unitPrice: 45 }
      ]
    }
  ].map(o => ({
    ...o,
    total: o.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
    itemsCount: o.items.reduce((sum, it) => sum + it.qty, 0)
  }))), []);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [orders]
  );

  const matches = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    if (!q) return [];
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.items.some(it => it.name.toLowerCase().includes(q))
    );
  }, [orders, searchId]);

  // Preselect if /track-order?id=ORD-... is used
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSearchId(id);
      const found = orders.find(o => o.id.toLowerCase() === id.toLowerCase());
      if (found) setSelectedOrder(found);
    }
  }, [orders, searchParams]);

  const handleTrack = () => {
    if (!searchId.trim()) return;
    const found = orders.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase())
      || matches[0];
    setSelectedOrder(found || null);
    setLastRefresh(new Date());
  };

  const copyLink = async () => {
    if (!selectedOrder) return;
    try {
      const url = `${window.location.origin}/track-order?id=${encodeURIComponent(selectedOrder.id)}`;
      await navigator.clipboard.writeText(url);
      alert('Tracking link copied!');
    } catch {
      alert('Unable to copy link.');
    }
  };

  const timeline = buildTimeline(selectedOrder);
  const lastEventTime = timeline.length ? timeline[timeline.length - 1].time : null;
  const eta = getETA(selectedOrder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Pill-Shaped Glassy Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <nav className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-full shadow-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-all duration-500 hover:bg-white/25 hover:shadow-3xl">
            <div className="flex justify-between items-center gap-2">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative group cursor-pointer">
                  <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-2 sm:p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Factory className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none">CSMS</span>
                  <p className="text-[10px] sm:text-xs text-black-600 font-semibold tracking-wider uppercase hidden xs:block">Supply Management</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link href="/" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Home</Link>

                {/* Dropdown (Products) */}
                <div className="relative group">
                  <Link href="/products"
                    className="flex items-center px-5 py-2.5 text-black-700 hover:text-blue-600 font-semibold transition-all duration-300 rounded-xl hover:bg-blue-50/50 group"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    Products
                    <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180 duration-300" />
                  </Link>
                  <div
                    className={`absolute ${dropdownOpen ? 'visible opacity-100' : 'invisible opacity-0'} top-full left-0 mt-3 bg-white/98 backdrop-blur-xl shadow-2xl rounded-2xl py-6 w-80 border border-gray-100/50 transform translate-y-3 ${dropdownOpen ? 'translate-y-0' : ''} transition-all duration-300`}
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4">
                      <div className="flex items-center text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-blue-100/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer group/item">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl mr-4 group-hover/item:from-blue-200 group-hover/item:to-blue-300 transition-all duration-300 shadow-sm">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base mb-1">Premium Cement</p>
                          <p className="text-sm text-gray-500">Bulk & bagged solutions for all projects</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors duration-300" />
                      </div>
                      <div className="flex items-center text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer group/item">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl mr-4 group-hover/item:from-gray-200 group-hover/item:to-gray-300 transition-all duration-300 shadow-sm">
                          <Truck className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base mb-1">Quality Aggregate</p>
                          <p className="text-sm text-gray-500">Various grades & sizes available</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors duration-300" />
                      </div>
                      <div className="flex items-center text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-amber-50/70 hover:to-amber-100/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer group/item">
                        <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl mr-4 group-hover/item:from-amber-200 group-hover/item:to-amber-300 transition-all duration-300 shadow-sm">
                          <Factory className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base mb-1">Construction Sand</p>
                          <p className="text-sm text-gray-500">Fine & coarse varieties in stock</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/place-order" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Place Order</Link>
                <Link href="/track-order" className="px-4 py-2 text-blue-600 font-medium transition-all duration-300 rounded-full bg-white/40 text-sm">Track Order</Link>
                <Link href="/order-history" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Order History</Link>
                <Link href="/dashboard" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Dashboard</Link>
              </div>

              {/* CTA (hide when authenticated) */}
              {!user ? (
                <div className="hidden lg:flex items-center space-x-3">
                  <Link href="/login" className="text-black-800 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-white/40 transition-all duration-300 text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm">
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  <button onClick={() => logout()} className="text-black-800 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-white/40 transition-all duration-300 text-sm">Logout</button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-full hover:bg-white/40 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-800" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-800" />
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4">
              <div className="bg-white/25 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-6">
                <nav className="flex flex-col space-y-2">
                  <Link href="/" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Home
                  </Link>
                  <Link href="/products" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Products
                  </Link>
                  <Link href="/place-order" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Place Order
                  </Link>
                  <Link href="/track-order" className="px-4 py-3 text-blue-600 bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Track Order
                  </Link>
                  <Link href="/order-history" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Order History
                  </Link>
                  <Link href="/dashboard" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Dashboard
                  </Link>
                  {!user ? (
                    <div className="pt-4 space-y-3 border-t border-white/20">
                      <Link href="/login" className="w-full text-center text-gray-800 hover:text-blue-600 font-medium px-4 py-3 rounded-2xl hover:bg-white/40 transition-all duration-300 border border-white/30">
                        Login
                      </Link>
                      <Link href="/signup" className="w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg">
                        Get Started
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-3 border-t border-white/20">
                      <button onClick={() => logout()} className="w-full text-center text-gray-800 hover:text-blue-600 font-medium px-4 py-3 rounded-2xl hover:bg-white/40 transition-all duration-300 border border-white/30">Logout</button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <section className="pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Track Order
            </h1>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Enter your Order ID to view real-time status, ETA, and delivery details.
            </p>
          </div>

          {/* Search / Finder */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-end">
              <div className="md:col-span-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Order ID</label>
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    placeholder="e.g., ORD-2024-0007"
                    className="w-full pl-10 p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                  />
                </div>
                {matches.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {matches.slice(0, 5).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSearchId(m.id); setSelectedOrder(m); }}
                        className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-700"
                      >
                        {m.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-4 flex gap-3">
                <button
                  onClick={handleTrack}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3.5 rounded-2xl font-bold shadow hover:shadow-lg transition-all"
                >
                  Track
                </button>
                <button
                  onClick={() => { setSearchId(''); setSelectedOrder(null); }}
                  className="flex-1 inline-flex items-center justify-center px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Tracking Details */}
          {!selectedOrder ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-gray-100 shadow-xl text-center text-gray-600">
              Search for an order above to see live tracking details.
            </div>
          ) : (
            <>
              {/* Top: Status + Steps */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500">Order</div>
                    <div className="text-2xl font-black text-gray-900">{selectedOrder.id}</div>
                    <div className="text-sm text-gray-500">{formatDate(selectedOrder.date)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                <div className="mt-6">
                  <ProgressSteps status={selectedOrder.status} />
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm text-gray-500 font-bold">ETA</div>
                    <div className="text-xl font-black text-gray-900 mt-1">{eta}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm text-gray-500 font-bold">Last updated</div>
                    <div className="text-xl font-black text-gray-900 mt-1">
                      {lastEventTime ? formatDate(lastEventTime.toISOString()) : formatDate(selectedOrder.date)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm text-gray-500 font-bold">Order Total</div>
                    <div className="text-xl font-black text-gray-900 mt-1">SAR {selectedOrder.total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setLastRefresh(new Date())}
                    className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold inline-flex items-center transition-all"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 rounded-2xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold inline-flex items-center transition-all"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy tracking link
                  </button>
                </div>
              </div>

              {/* Middle: Delivery + Driver + Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                {/* Delivery Details */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-black text-gray-900">Delivery Details</div>
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-bold text-gray-500">City</div>
                      <div className="font-semibold text-gray-800 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                        {selectedOrder.city}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-500">Address</div>
                      <div className="text-gray-700 mt-1">{selectedOrder.address}</div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mt-4">
                      <div className="text-sm font-bold text-gray-500">Notes</div>
                      <div className="text-gray-700 mt-1">{selectedOrder.notes}</div>
                    </div>
                  )}

                  <div className="mt-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-black text-gray-900">Items</div>
                      <div className="text-sm text-gray-500">{selectedOrder.itemsCount} items</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{it.name}</div>
                            <div className="text-sm text-gray-500">Qty: {it.qty} {it.unit} × SAR {it.unitPrice}</div>
                          </div>
                          <div className="font-bold text-gray-900">SAR {(it.qty * it.unitPrice).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm font-bold text-gray-500">Total</div>
                      <div className="text-xl font-black text-gray-900">SAR {selectedOrder.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Driver + Timeline */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                  <div className="text-lg font-black text-gray-900 mb-6">Live Tracking</div>

                  {/* Map placeholder */}
                  <div className="h-40 rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center text-gray-500">
                    <Navigation className="h-6 w-6 text-blue-600 mr-2" />
                    Live map coming soon
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-bold text-gray-500 mb-2">Driver</div>
                    {selectedOrder.status === STATUS.OUT_FOR_DELIVERY ? (
                      <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                        <div className="font-bold text-gray-900">Ahmed Khan</div>
                        <div className="text-sm text-gray-600">Vehicle: JD-4321</div>
                        <div className="mt-3 flex gap-2">
                          <a href="tel:+966501234567" className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
                            <Phone className="h-4 w-4 mr-2" /> Call
                          </a>
                          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold transition-all">
                            <Truck className="h-4 w-4 mr-2" /> Track
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white text-gray-600">
                        Driver details will appear once the order is out for delivery.
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-bold text-gray-500 mb-3">Timeline</div>
                    <div className="space-y-3">
                      {timeline.map((ev) => {
                        const Icon = ev.icon;
                        return (
                          <div key={ev.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center">
                              <Icon className={`h-4 w-4 mr-2 ${ev.key === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`} />
                              <div className="font-semibold text-gray-800">{ev.label}</div>
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(ev.time.toISOString())}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <a
                      href="tel:+966121234567"
                      className="w-full inline-flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl py-3 font-bold text-gray-800 hover:bg-gray-50 transition-all"
                    >
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      Contact Support
                    </a>
                    <button
                      onClick={() => alert('Invoice download coming soon')}
                      disabled={selectedOrder.status !== STATUS.DELIVERED}
                      className={`w-full inline-flex items-center justify-center rounded-2xl py-3 font-bold transition-all ${
                        selectedOrder.status !== STATUS.DELIVERED
                          ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                      }`}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Invoice
                    </button>
                    <button
                      onClick={() => alert(`Reordering ${selectedOrder.id} ...`)}
                      disabled={selectedOrder.status === STATUS.CANCELLED}
                      className={`w-full inline-flex items-center justify-center rounded-2xl py-3 font-bold transition-all ${
                        selectedOrder.status === STATUS.CANCELLED
                          ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow'
                      }`}
                    >
                      <Package className="h-5 w-5 mr-2" />
                      Reorder Items
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent orders quick pick */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-lg font-black text-gray-900">Recent Orders</div>
                  <Link href="/order-history" className="text-sm font-bold text-blue-600 hover:text-blue-700">View history</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-black text-gray-900">{o.id}</div>
                          <div className="text-sm text-gray-500">{formatDate(o.date)}</div>
                          <div className="mt-2 text-sm text-gray-700 flex items-center">
                            <MapPin className="h-4 w-4 text-blue-600 mr-1" /> {o.city}
                          </div>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => { setSelectedOrder(o); setSearchId(o.id); }}
                          className="flex-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all text-sm inline-flex items-center justify-center"
                        >
                          <Search className="h-4 w-4 mr-1" /> Track
                        </button>
                        <button
                          onClick={() => alert('Invoice download coming soon')}
                          disabled={o.status !== STATUS.DELIVERED}
                          className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm inline-flex items-center justify-center transition-all ${
                            o.status !== STATUS.DELIVERED
                              ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                          }`}
                        >
                          <Download className="h-4 w-4 mr-1" /> Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default TrackOrder;