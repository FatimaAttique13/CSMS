'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Factory,
  Menu,
  X,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Search,
  ArrowRight,
  MapPin,
  Calendar,
  Phone,
  DollarSign,
  TrendingUp,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Bell,
  Building2
} from 'lucide-react';

// Status constants shared across pages (same as OrderHistory)
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

const CustomerDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filters and UI state
  const [timeframe, setTimeframe] = useState('30d'); // 7d | 30d | ytd | all
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your dashboard is ready!', time: 'Just now', read: false }
  ]);

  // API data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map(o => ({
            id: o._id || o.orderNumber || `ORD-${Date.now()}`,
            date: o.createdAt || o.orderDate || new Date().toISOString(),
            status: o.status || STATUS.PENDING,
            city: o.deliveryAddress?.city || o.city || 'N/A',
            address: o.deliveryAddress?.fullAddress || o.address || 'No address provided',
            notes: o.notes || o.specialInstructions || '',
            items: Array.isArray(o.items) ? o.items.map(item => ({
              name: item.productName || item.name || 'Unknown Product',
              qty: item.quantity || 0,
              unit: item.unit || 'units',
              unitPrice: item.unitPrice || item.price || 0
            })) : [],
            total: typeof o.totalAmount === 'number' ? o.totalAmount : 0,
            itemsCount: Array.isArray(o.items) ? o.items.reduce((sum, it) => sum + (it.quantity || 0), 0) : 0
          }));
          setOrders(mapped);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Derived filters
  const filteredByTime = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (timeframe === '7d') start.setDate(now.getDate() - 7);
    if (timeframe === '30d') start.setDate(now.getDate() - 30);
    if (timeframe === 'ytd') start.setMonth(0, 1), start.setHours(0,0,0,0);
    if (timeframe === 'all') return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

    return orders
      .filter(o => new Date(o.date) >= start)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, timeframe]);

  const searchedOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredByTime;
    return filteredByTime.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.items.some(it => it.name.toLowerCase().includes(q))
    );
  }, [filteredByTime, query]);

  // Metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredByTime.length;
    const pendingCount = filteredByTime.filter(o =>
      [STATUS.PENDING, STATUS.CONFIRMED, STATUS.OUT_FOR_DELIVERY].includes(o.status)
    ).length;
    const outstanding = filteredByTime
      .filter(o => [STATUS.PENDING, STATUS.CONFIRMED, STATUS.OUT_FOR_DELIVERY].includes(o.status))
      .reduce((s, o) => s + o.total, 0);
    const deliveredCount = filteredByTime.filter(o => o.status === STATUS.DELIVERED).length;
    const onTimeRate = 0.995; // placeholder; replace with real metric when available

    const spend = filteredByTime.reduce((s, o) => s + o.total, 0);
    return {
      totalOrders,
      pendingCount,
      outstanding,
      deliveredCount,
      onTimeRate,
      spend
    };
  }, [filteredByTime]);

  // Trend (last 6 months spend, delivered only)
  const trend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleString('en-GB', { month: 'short' }), total: 0 });
    }
    const delivered = orders.filter(o => o.status === STATUS.DELIVERED);
    delivered.forEach(o => {
      const key = new Date(o.date).toISOString().slice(0, 7);
      const m = months.find(x => x.key === key);
      if (m) m.total += o.total;
    });
    const max = Math.max(1, ...months.map(m => m.total));
    return { months, max };
  }, [orders]);

  const recentOrders = useMemo(() => searchedOrders.slice(0, 5), [searchedOrders]);

  const upcoming = useMemo(() => {
    // Show confirmed/out for delivery orders as upcoming (sorted by date asc)
    return searchedOrders
      .filter(o => [STATUS.CONFIRMED, STATUS.OUT_FOR_DELIVERY, STATUS.PENDING].includes(o.status))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  }, [searchedOrders]);

  // Reorder suggestions based on frequency
  const suggestions = useMemo(() => {
    const freq = new Map();
    orders.forEach(o => {
      o.items.forEach(it => {
        const key = it.name;
        if (!freq.has(key)) freq.set(key, { name: key, totalQty: 0, unit: it.unit, avgPrice: it.unitPrice, count: 0 });
        const f = freq.get(key);
        f.totalQty += it.qty;
        f.count += 1;
        f.avgPrice = it.unitPrice; // simplistic; replace with weighted avg if needed
      });
    });
    return Array.from(freq.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 4);
  }, [orders]);

  const markNotificationRead = (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Pill Navbar (consistent with other pages) */}
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

              {/* Nav */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link href="/" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Home
                </Link>

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
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:item:text-blue-600 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/place-order" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Place Order
                </Link>
                <Link href="/track-order" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Track Order
                </Link>
                <Link href="/order-history" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Order History
                </Link>
                <Link href="/dashboard" className="px-4 py-2 text-blue-600 font-medium transition-all duration-300 rounded-full bg-white/40 text-sm">
                  Dashboard
                </Link>
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

              {/* Mobile Menu */}
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

          {/* Mobile Panel */}
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
                  <Link href="/track-order" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Track Order
                  </Link>
                  <Link href="/order-history" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Order History
                  </Link>
                  <Link href="/dashboard" className="px-4 py-3 text-blue-600 bg-white/40 rounded-2xl font-medium transition-all duration-300">
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
      <section className="pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header + filters */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
                Customer Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Overview of your orders, deliveries, invoices, and insights.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders or products..."
                  className="pl-10 p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                />
              </div>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="ytd">Year to date</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={() => { setTimeframe('30d'); setQuery(''); }}
                className="inline-flex items-center px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" /> Reset
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Total Orders</span>
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">{metrics.totalOrders}</div>
              <div className="text-sm text-gray-500 mt-1">In selected range</div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Pending Orders</span>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">{metrics.pendingCount}</div>
              <div className="text-sm text-gray-500 mt-1">Pending / Confirmed / Out</div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Outstanding</span>
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">SAR {metrics.outstanding.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">Awaiting completion</div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">On-time Delivery</span>
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">{(metrics.onTimeRate * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-500 mt-1">Last 6 months</div>
            </div>
          </div>

          {/* Top grid: Spend Trend + Quick Actions + Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
            {/* Spend Trend */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-black text-gray-900">Spend Trend</div>
                  <div className="text-sm text-gray-500">Delivered orders (last 6 months)</div>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-40 flex items-end gap-3">
                {trend.months.map((m, idx) => {
                  const h = Math.round((m.total / trend.max) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-6 sm:w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl" style={{ height: `${Math.max(6, h)}%` }}></div>
                      <div className="mt-2 text-xs text-gray-500 font-semibold">{m.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Total: <span className="font-bold text-gray-800">SAR {orders.filter(o => o.status === STATUS.DELIVERED).reduce((s, o) => s + o.total, 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="text-lg font-black text-gray-900 mb-6">Quick Actions</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/place-order" className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-4 font-bold flex items-center justify-center shadow hover:shadow-lg transition-all">
                  <Package className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Place Order
                </Link>
                <Link href="/order-history" className="group bg-white border-2 border-gray-200 rounded-2xl p-4 font-bold flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all">
                  <FileText className="h-5 w-5 mr-2 text-gray-700" />
                  View Invoices
                </Link>
                <Link href="/track-order" className="group bg-white border-2 border-gray-200 rounded-2xl p-4 font-bold flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all">
                  <Search className="h-5 w-5 mr-2 text-gray-700" />
                  Track Order
                </Link>
                <button className="group bg-white border-2 border-gray-200 rounded-2xl p-4 font-bold flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all">
                  <RefreshCw className="h-5 w-5 mr-2 text-gray-700" />
                  Smart Reorder
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                Need help? Contact support 24/7 at <span className="font-semibold text-gray-700">+966 12 123 4567</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-black text-gray-900">Notifications</div>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start justify-between bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex-1">
                      <div className={`font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle grid: Upcoming + Recent Orders + Invoice Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
            {/* Upcoming Deliveries */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-black text-gray-900">Upcoming Deliveries</div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              {upcoming.length === 0 ? (
                <div className="text-gray-500">No upcoming deliveries in this range.</div>
              ) : (
                <div className="space-y-5">
                  {upcoming.map(o => (
                    <div key={o.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-black text-gray-900">{o.id}</div>
                          <div className="text-gray-500 text-sm">{formatDate(o.date)}</div>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="mt-3 flex items-center text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-blue-600 mr-1" />
                        {o.city} • {o.address}
                      </div>
                      <div className="mt-4">
                        <ProgressSteps status={o.status} />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all text-sm inline-flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" /> Details
                        </button>
                        <button
                          disabled={o.status === STATUS.CANCELLED}
                          onClick={() => alert('Tracking coming soon')}
                          className={`px-3 py-2 rounded-xl font-semibold text-sm inline-flex items-center transition-all ${
                            o.status === STATUS.CANCELLED
                              ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                          }`}
                        >
                          <Truck className="h-4 w-4 mr-1" /> Track
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-black text-gray-900">Recent Orders</div>
                <Link href="/order-history" className="text-sm font-bold text-blue-600 hover:text-blue-700">View all</Link>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 && (
                  <div className="text-gray-500">No orders found for current filters.</div>
                )}
                {recentOrders.map(o => (
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all text-sm inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </button>
                      <button
                        onClick={() => alert('Invoice download coming soon')}
                        disabled={o.status !== STATUS.DELIVERED}
                        className={`px-3 py-2 rounded-xl font-semibold text-sm inline-flex items-center transition-all ${
                          o.status !== STATUS.DELIVERED
                            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                        }`}
                      >
                        <Download className="h-4 w-4 mr-1" /> Invoice
                      </button>
                      <button
                        onClick={() => alert(`Reordering ${o.id} ...`)}
                        disabled={o.status === STATUS.CANCELLED}
                        className={`px-3 py-2 rounded-xl font-semibold text-sm inline-flex items-center transition-all ${
                          o.status === STATUS.CANCELLED
                            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow'
                        }`}
                      >
                        <Package className="h-4 w-4 mr-1" /> Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-black text-gray-900">Invoice Summary</div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 font-medium">Outstanding</div>
                  <div className="font-black text-gray-900">SAR {metrics.outstanding.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 font-medium">Delivered (in range)</div>
                  <div className="font-black text-gray-900">{metrics.deliveredCount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 font-medium">Total Spend (range)</div>
                  <div className="font-black text-gray-900">SAR {metrics.spend.toFixed(2)}</div>
                </div>
              </div>
              <Link href="/order-history"
                className="mt-6 inline-flex items-center justify-center w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 rounded-2xl font-bold hover:from-gray-800 hover:to-black transition-all"
              >
                Go to Invoice Center <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Bottom grid: Reorder Suggestions + Saved Sites */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Suggestions */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-black text-gray-900">Reorder Suggestions</div>
                <RefreshCw className="h-5 w-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center mb-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mr-3">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{s.name}</div>
                        <div className="text-sm text-gray-500">Ordered {s.count} times</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <div>Total qty: <span className="font-semibold">{s.totalQty} {s.unit}</span></div>
                      <div>Avg price: <span className="font-semibold">SAR {s.avgPrice}</span></div>
                    </div>
                    <button
                      onClick={() => alert(`Reordering ${s.name} ...`)}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Sites / Contacts */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="text-lg font-black text-gray-900 mb-6">Saved Sites</div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center mb-1">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="font-bold text-gray-900">Site A — King Abdullah Road</div>
                  </div>
                  <div className="text-sm text-gray-600">Jeddah 21589</div>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center mb-1">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="font-bold text-gray-900">Site B — Al Haramain Rd</div>
                  </div>
                  <div className="text-sm text-gray-600">Makkah 24227</div>
                </div>
              </div>
              <button className="mt-5 w-full bg-white border-2 border-gray-200 rounded-2xl py-3 font-bold text-gray-800 hover:bg-gray-50 transition-all">
                Manage Sites
              </button>
              <div className="mt-6 text-sm text-gray-500">
                Need assistance? <span className="inline-flex items-center font-semibold text-gray-700"><Phone className="h-4 w-4 mr-1 text-blue-600" /> +966 12 123 4567</span>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </section>

      {/* Order Details Modal (reuses styling from OrderHistory) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full p-6 sm:p-8 z-[61]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
            <div className="mb-6">
              <div className="text-xs font-bold text-gray-500">Order</div>
              <div className="text-2xl font-black text-gray-900">{selectedOrder.id}</div>
              <div className="text-sm text-gray-500">{formatDate(selectedOrder.date)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="text-sm font-bold text-gray-500">Status</div>
                <StatusBadge status={selectedOrder.status} />
                <div className="pt-2">
                  <ProgressSteps status={selectedOrder.status} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-gray-500">Delivery</div>
                <div className="font-semibold text-gray-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                  {selectedOrder.city}
                </div>
                <div className="text-gray-600">{selectedOrder.address}</div>
              </div>
              {selectedOrder.notes && (
                <div className="md:col-span-2">
                  <div className="text-sm font-bold text-gray-500">Notes</div>
                  <div className="text-gray-700">{selectedOrder.notes}</div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4 sm:p-5">
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

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => alert('Invoice download coming soon')}
                disabled={selectedOrder.status === STATUS.CANCELLED}
                className={`px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 ${
                  selectedOrder.status === STATUS.CANCELLED
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
                className={`px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 ${
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
      )}
    </div>
  );
};

export default CustomerDashboard;