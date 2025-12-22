'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  Factory,
  Menu,
  X,
  ChevronDown,
  Search,
  Filter,
  Calendar,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  Eye,
  ArrowRight
} from 'lucide-react';

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

const OrderHistory = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filters/sort/pagination
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [city, setCity] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal for details
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Derived: filter/sort/paginate
  const filtered = useMemo(() => {
    let list = [...orders];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.items.some(it => it.name.toLowerCase().includes(q))
      );
    }

    if (status !== 'All') {
      list = list.filter(o => o.status === status);
    }

    if (city !== 'All') {
      list = list.filter(o => o.city === city);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      list = list.filter(o => new Date(o.date) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      // include the entire toDate day
      to.setHours(23, 59, 59, 999);
      list = list.filter(o => new Date(o.date) <= to);
    }

    switch (sortBy) {
      case 'Newest':
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'Oldest':
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'AmountHigh':
        list.sort((a, b) => b.total - a.total);
        break;
      case 'AmountLow':
        list.sort((a, b) => a.total - b.total);
        break;
      default:
        break;
    }

    return list;
  }, [orders, query, status, city, fromDate, toDate, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Summary metrics (reflect current filters)
  const summary = useMemo(() => {
    const totalOrders = filtered.length;
    const totalSpend = filtered.reduce((s, o) => s + o.total, 0);
    const pendingAmount = filtered
      .filter(o => [STATUS.PENDING, STATUS.CONFIRMED].includes(o.status))
      .reduce((s, o) => s + o.total, 0);
    const deliveredCount = filtered.filter(o => o.status === STATUS.DELIVERED).length;

    return { totalOrders, totalSpend, pendingAmount, deliveredCount };
  }, [filtered]);

  const resetFilters = () => {
    setQuery('');
    setStatus('All');
    setCity('All');
    setFromDate('');
    setToDate('');
    setSortBy('Newest');
    setPage(1);
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

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Pill-Shaped Glassy Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <nav className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-full shadow-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-all duration-500 hover:bg-white/25 hover:shadow-3xl">
            <div className="flex justify-between items-center gap-2">
              {/* Compact Logo */}
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
                <Link href="/" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Home
                </Link>

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
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:item:text-blue-600 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/orders/place" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Place Order
                </Link>
                <Link href="/track-order" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Track Order
                </Link>
                <Link href="/order-history" className="px-4 py-2 text-blue-600 font-medium transition-all duration-300 rounded-full bg-white/40 text-sm">
                  Order History
                </Link>
                <Link href="/contact" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Contact
                </Link>
              </div>

              {/* CTA Buttons (hide when authenticated) */}
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
                  <Link href="/orders/place" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Place Order
                  </Link>
                  <Link href="/track-order" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Track Order
                  </Link>
                  <Link href="/order-history" className="px-4 py-3 text-blue-600 bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Order History
                  </Link>
                  
                  <Link href="/contact" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Contact
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
              Order History
            </h1>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Review your past orders, filter by status and date, download invoices, and reorder in one click.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Total Orders</span>
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">{summary.totalOrders}</div>
              <div className="text-sm text-gray-500 mt-1">Filtered results</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Total Spend</span>
                <FileText className="h-6 w-6 text-gray-700" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">SAR {summary.totalSpend.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">Across filtered orders</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Pending Amount</span>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">SAR {summary.pendingAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">Pending & Confirmed</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Delivered</span>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">{summary.deliveredCount}</div>
              <div className="text-sm text-gray-500 mt-1">Delivered orders</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-end">
              <div className="lg:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="Search by Order ID or product..."
                    className="w-full pl-10 p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                >
                  <option>All</option>
                  <option>{STATUS.PENDING}</option>
                  <option>{STATUS.CONFIRMED}</option>
                  <option>{STATUS.OUT_FOR_DELIVERY}</option>
                  <option>{STATUS.DELIVERED}</option>
                  <option>{STATUS.CANCELLED}</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                >
                  <option>All</option>
                  <option>Jeddah</option>
                  <option>Makkah</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">From</label>
                <div className="relative">
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                    className="w-full pl-10 p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">To</label>
                <div className="relative">
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                    className="w-full pl-10 p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                >
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                  <option value="AmountHigh">Amount: High to Low</option>
                  <option value="AmountLow">Amount: Low to High</option>
                </select>
              </div>

              <div className="lg:col-span-12 flex flex-wrap gap-3 pt-2">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table (desktop) */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
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
              <div className="hidden md:block bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Order</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">City</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Items</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                          No orders found. Try adjusting your filters.
                        </td>
                      </tr>
                    )}
                    {paged.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900">{o.id}</div>
                      <div className="text-sm text-gray-500">Address: {o.address}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(o.date)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                        {o.city}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{o.itemsCount}</td>
                    <td className="px-6 py-4 font-black text-gray-900">SAR {o.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 inline-flex items-center"
                          title="View details"
                        >
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </button>
                        <button
                          onClick={() => alert('Invoice download coming soon')}
                          disabled={o.status === STATUS.CANCELLED}
                          className={`px-3 py-2 rounded-xl font-semibold inline-flex items-center transition-all duration-200 ${
                            o.status === STATUS.CANCELLED
                              ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                          }`}
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4 mr-1.5" /> Invoice
                        </button>
                        <button
                          onClick={() => alert(`Reordering ${o.id} ...`)}
                          disabled={o.status === STATUS.CANCELLED}
                          className={`px-3 py-2 rounded-xl font-semibold inline-flex items-center transition-all duration-200 ${
                            o.status === STATUS.CANCELLED
                              ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow'
                          }`}
                          title="Reorder"
                        >
                          <Package className="h-4 w-4 mr-1.5" /> Reorder
                        </button>
                      </div>
                    </td>
                  </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Orders Cards (mobile) */}
              <div className="md:hidden grid grid-cols-1 gap-4 sm:gap-6">
                {paged.length === 0 && (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 text-center text-gray-500">
                    No orders found. Try adjusting your filters.
                  </div>
                )}

                {paged.map((o) => (
              <div key={o.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-black text-gray-900 text-lg">{o.id}</div>
                    <div className="text-gray-500 text-sm">{formatDate(o.date)}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-500">City</div>
                  <div className="font-semibold text-gray-800 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" /> {o.city}
                  </div>
                  <div className="text-gray-500">Items</div>
                  <div className="font-semibold text-gray-800">{o.itemsCount}</div>
                  <div className="text-gray-500">Total</div>
                  <div className="font-black text-gray-900">SAR {o.total.toFixed(2)}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="flex-1 px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 inline-flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1.5" /> View
                  </button>
                  <button
                    onClick={() => alert('Invoice download coming soon')}
                    disabled={o.status === STATUS.CANCELLED}
                    className={`flex-1 px-4 py-2 rounded-2xl font-semibold inline-flex items-center justify-center transition-all duration-200 ${
                      o.status === STATUS.CANCELLED
                        ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                    }`}
                  >
                    <Download className="h-4 w-4 mr-1.5" /> Invoice
                  </button>
                  <button
                    onClick={() => alert(`Reordering ${o.id} ...`)}
                    disabled={o.status === STATUS.CANCELLED}
                    className={`flex-1 px-4 py-2 rounded-2xl font-semibold inline-flex items-center justify-center transition-all duration-200 ${
                      o.status === STATUS.CANCELLED
                        ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow'
                    }`}
                  >
                    <Package className="h-4 w-4 mr-1.5" /> Reorder
                  </button>
                </div>
              </div>
            ))}
              </div>

              {/* Pagination */}
              {paged.length > 0 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-gray-600 text-sm">
                    Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-bold ${
                          page === p
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Order Details Modal */}
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

export default OrderHistory;
