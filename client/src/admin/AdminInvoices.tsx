"use client"
import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
  Factory,
  Menu,
  X,
  ChevronDown,
  Search,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  Mail,
  Edit,
  Printer,
  Filter,
  Eye,
  ArrowRight
} from 'lucide-react';

const INVOICE_STATUS = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
};

const invoiceStatusStyles = (status: string) => {
  switch (status) {
    case INVOICE_STATUS.PAID:
      return 'bg-green-100 text-green-700 border-green-200';
    case INVOICE_STATUS.PARTIALLY_PAID:
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case INVOICE_STATUS.SENT:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case INVOICE_STATUS.OVERDUE:
      return 'bg-red-100 text-red-700 border-red-200';
    case INVOICE_STATUS.DRAFT:
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case INVOICE_STATUS.CANCELLED:
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const InvoiceStatusBadge = ({ status }: { status: string }) => {
  const Icon =
    status === INVOICE_STATUS.PAID ? CheckCircle :
    status === INVOICE_STATUS.PARTIALLY_PAID ? Clock :
    status === INVOICE_STATUS.SENT ? Mail :
    status === INVOICE_STATUS.OVERDUE ? AlertCircle :
    status === INVOICE_STATUS.CANCELLED ? XCircle : FileText;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${invoiceStatusStyles(status)}`}>
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

const daysUntil = (iso: string) => {
  const now = new Date();
  const due = new Date(iso);
  const diff = Math.ceil((Number(due) - Number(now)) / (1000 * 60 * 60 * 24));
  return diff;
};

type InvItem = { name: string; qty: number; unit: string; unitPrice: number };
type Invoice = {
  id: string;
  orderId: string;
  customer: string;
  city: string;
  address: string;
  issueDate: string;
  dueDate: string;
  status: string;
  taxRate: number;
  items: InvItem[];
  // After seeding these fields are always present
  amountPaid: number;
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  paidPercent: number;
};

const seedInvoices = (): Invoice[] => ([
  {
    id: 'INV-2024-0018',
    orderId: 'ORD-2024-0007',
    customer: 'Makkah Build Co.',
    city: 'Makkah',
    address: 'Downtown Site C, Gate 2',
    issueDate: '2024-10-12T08:00:00Z',
    dueDate: '2024-10-19T23:59:59Z',
    status: INVOICE_STATUS.PAID,
    taxRate: 0.15,
    items: [{ name: 'Coarse Sand', qty: 6, unit: 'tons', unitPrice: 35 }],
    amountPaid: null // will be filled after compute
  },
  {
    id: 'INV-2024-0019',
    orderId: 'ORD-2024-0008',
    customer: 'Jeddah Concrete Ltd.',
    city: 'Jeddah',
    address: 'Al Faisaliyah District, Plot 22',
    issueDate: '2024-09-25T13:30:00Z',
    dueDate: '2024-10-05T23:59:59Z',
    status: INVOICE_STATUS.PARTIALLY_PAID,
    taxRate: 0.15,
    items: [
      { name: 'Crushed Granite 20mm', qty: 8, unit: 'tons', unitPrice: 45 },
      { name: 'Coarse Sand', qty: 2, unit: 'tons', unitPrice: 35 }
    ],
    amountPaid: 250
  },
  {
    id: 'INV-2024-0017',
    orderId: 'ORD-2024-0002',
    customer: 'Makkah Metro JV',
    city: 'Makkah',
    address: 'Al Haramain Rd, 24227',
    issueDate: '2024-09-21T14:20:00Z',
    dueDate: '2024-09-30T23:59:59Z',
    status: INVOICE_STATUS.OVERDUE,
    taxRate: 0.15,
    items: [{ name: 'Crushed Granite 20mm', qty: 12, unit: 'tons', unitPrice: 45 }],
    amountPaid: 0
  },
  {
    id: 'INV-2024-0016',
    orderId: 'ORD-2024-0006',
    customer: 'Jeddah Build Group',
    city: 'Jeddah',
    address: 'King Abdullah Road, 21589',
    issueDate: '2024-07-19T10:00:00Z',
    dueDate: '2024-07-31T23:59:59Z',
    status: INVOICE_STATUS.PAID,
    taxRate: 0.15,
    items: [{ name: 'Premium Portland Cement', qty: 60, unit: 'bags', unitPrice: 75 }],
    amountPaid: null
  },
  {
    id: 'INV-2024-0015',
    orderId: 'ORD-2024-0001',
    customer: 'Site A Contractors',
    city: 'Jeddah',
    address: 'Gate 3, King Abdullah Road',
    issueDate: '2024-09-18T09:45:00Z',
    dueDate: '2024-09-25T23:59:59Z',
    status: INVOICE_STATUS.PAID,
    taxRate: 0.15,
    items: [
      { name: 'Premium Portland Cement', qty: 50, unit: 'bags', unitPrice: 75 },
      { name: 'Coarse Sand', qty: 2, unit: 'tons', unitPrice: 35 }
    ],
    amountPaid: null
  },
  {
    id: 'INV-2024-0020',
    orderId: 'ORD-2024-0009',
    customer: 'Alpha Infra Co.',
    city: 'Makkah',
    address: 'Site D, East Zone',
    issueDate: '2024-10-15T18:20:00Z',
    dueDate: '2024-10-25T23:59:59Z',
    status: INVOICE_STATUS.SENT,
    taxRate: 0.15,
    items: [{ name: 'Premium Portland Cement', qty: 40, unit: 'bags', unitPrice: 75 }],
    amountPaid: 0
  },
  {
    id: 'INV-2024-0021',
    orderId: 'ORD-2024-0004',
    customer: 'Industrial Warehouse 12',
    city: 'Jeddah',
    address: 'Industrial Area',
    issueDate: '2024-10-10T16:40:00Z',
    dueDate: '2024-10-20T23:59:59Z',
    status: INVOICE_STATUS.DRAFT,
    taxRate: 0.15,
    items: [
      { name: 'Crushed Granite 20mm', qty: 5, unit: 'tons', unitPrice: 45 },
      { name: 'Coarse Sand', qty: 3, unit: 'tons', unitPrice: 35 }
    ],
    amountPaid: 0
  },
  {
    id: 'INV-2024-0014',
    orderId: 'ORD-2024-0010',
    customer: 'Seaside Project',
    city: 'Jeddah',
    address: 'Seaside District, Lot 5',
    issueDate: '2024-06-14T09:15:00Z',
    dueDate: '2024-06-25T23:59:59Z',
    status: INVOICE_STATUS.CANCELLED,
    taxRate: 0.15,
    items: [{ name: 'Crushed Granite 20mm', qty: 10, unit: 'tons', unitPrice: 45 }],
    amountPaid: 0
  },
  {
    id: 'INV-2024-0022',
    orderId: 'ORD-2024-0003',
    customer: 'North Gate Developers',
    city: 'Jeddah',
    address: 'Site B, Near North Gate',
    issueDate: '2024-10-03T08:05:00Z',
    dueDate: '2024-10-13T23:59:59Z',
    status: INVOICE_STATUS.PARTIALLY_PAID,
    taxRate: 0.15,
    items: [
      { name: 'Premium Portland Cement', qty: 30, unit: 'bags', unitPrice: 75 },
      { name: 'Coarse Sand', qty: 4, unit: 'tons', unitPrice: 35 }
    ],
    amountPaid: 1000
  }
]).map(inv => {
  const subtotal = inv.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const tax = +(subtotal * inv.taxRate).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const amountPaid = inv.amountPaid == null ? total : inv.amountPaid;
  const balance = +(total - amountPaid).toFixed(2);
  const paidPercent = Math.max(0, Math.min(100, Math.round((amountPaid / total) * 100)));
  return { ...inv, subtotal, tax, total, amountPaid, balance, paidPercent };
});

const AdminInvoices = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth() as any;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Data
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices());

  // Filters/sort/pagination
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [city, setCity] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Selection + modal
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Derived: filter/sort
  const filtered = useMemo(() => {
    let list = [...invoices];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(inv =>
        inv.id.toLowerCase().includes(q) ||
        inv.orderId.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.city.toLowerCase().includes(q)
      );
    }

    if (status !== 'All') {
      list = list.filter(inv => inv.status === status);
    }

    if (city !== 'All') {
      list = list.filter(inv => inv.city === city);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      list = list.filter(inv => new Date(inv.issueDate) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      list = list.filter(inv => new Date(inv.issueDate) <= to);
    }

    switch (sortBy) {
      case 'Newest':
        list.sort((a, b) => Number(new Date(b.issueDate)) - Number(new Date(a.issueDate)));
        break;
      case 'Oldest':
        list.sort((a, b) => Number(new Date(a.issueDate)) - Number(new Date(b.issueDate)));
        break;
      case 'AmountHigh':
        list.sort((a, b) => b.total - a.total);
        break;
      case 'AmountLow':
        list.sort((a, b) => a.total - b.total);
        break;
      case 'DueSoon':
        list.sort((a, b) => Number(new Date(a.dueDate)) - Number(new Date(b.dueDate)));
        break;
      default:
        break;
    }

    return list;
  }, [invoices, query, status, city, fromDate, toDate, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Metrics (reflect current filters)
  const metrics = useMemo(() => {
    const count = filtered.length;
    const totalBilled = filtered.reduce((s, inv) => s + inv.total, 0);
    const collected = filtered.reduce((s, inv) => s + Math.min(inv.amountPaid, inv.total), 0);
    const outstanding = filtered
      .filter(inv => ![INVOICE_STATUS.CANCELLED, INVOICE_STATUS.PAID, INVOICE_STATUS.DRAFT].includes(inv.status))
      .reduce((s, inv) => s + Math.max(0, inv.balance), 0);
    const overdueCount = filtered.filter(inv => inv.status === INVOICE_STATUS.OVERDUE).length;

    return { count, totalBilled, collected, outstanding, overdueCount };
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

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllPage = () => {
    const ids = paged.map(p => p.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  // Actions (mock)
  const markAsPaid = (inv: Invoice) => {
    setInvoices(list => list.map(i => i.id === inv.id ? ({
      ...i, status: INVOICE_STATUS.PAID, amountPaid: i.total ?? 0, balance: 0, paidPercent: 100
    }) as Invoice : i));
    alert(`${inv.id} marked as Paid`);
  };
  const sendInvoice = (inv: Invoice) => {
    alert(`Sending ${inv.id} to customer...`);
  };
  const downloadInvoice = (inv: Invoice) => {
    alert(`Downloading PDF for ${inv.id} ...`);
  };
  const bulkSend = () => {
    if (selectedIds.size === 0) return;
    alert(`Sending invoices: ${Array.from(selectedIds).join(', ')}`);
    clearSelection();
  };
  const bulkMarkPaid = () => {
    if (selectedIds.size === 0) return;
    setInvoices(list => list.map(i => selectedIds.has(i.id) ? {
      ...i, status: INVOICE_STATUS.PAID, amountPaid: i.total, balance: 0, paidPercent: 100
    } : i));
    alert('Selected invoices marked as Paid');
    clearSelection();
  };

  const dueChip = (inv: Invoice) => {
    const d = daysUntil(inv.dueDate);
    if (inv.status === INVOICE_STATUS.PAID) return <span className="text-xs font-semibold text-green-600">Paid</span>;
    if (inv.status === INVOICE_STATUS.CANCELLED) return <span className="text-xs font-semibold text-gray-500">Cancelled</span>;
    if (d < 0) return <span className="text-xs font-semibold text-red-600">Overdue by {Math.abs(d)}d</span>;
    return <span className="text-xs font-semibold text-gray-700">Due in {d}d</span>;
  };

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
                <Link href="/admin/analytics" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Analytics
                </Link>
                <Link href="/admin/invoices" className="px-4 py-2 text-blue-600 font-medium transition-all duration-300 rounded-full bg-white/40 text-sm">
                  Invoices
                </Link>
                <Link href="/admin/inventory" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Inventory
                </Link>
                <Link href="/admin/reports" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Reports
                </Link>
                <Link href="/" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Exit
                </Link>
              </div>

              {/* CTA */}
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
                  <Link href="/order-history" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Order History
                  </Link>
                  <Link href="/dashboard" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Dashboard
                  </Link>
                  <Link href="/admin/invoices" className="px-4 py-3 text-blue-600 bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Admin Invoices
                  </Link>
                  <Link href="/admin/inventory" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Inventory
                  </Link>
                  <Link href="/admin/analytics" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Analytics
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
              Invoice Center (Admin)
            </h1>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Manage billing, track payments, and monitor outstanding balances.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Total Invoices</span>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">{metrics.count}</div>
              <div className="text-sm text-gray-500 mt-1">Filtered results</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Total Billed</span>
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">SAR {metrics.totalBilled.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">Sum of invoice totals</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Collected</span>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">SAR {metrics.collected.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">Payments received</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Outstanding</span>
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900">SAR {metrics.outstanding.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">Unpaid & partially paid</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-end">
              <div className="lg:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="Search by Invoice ID, Order ID, customer, or city..."
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
                  <option>{INVOICE_STATUS.DRAFT}</option>
                  <option>{INVOICE_STATUS.SENT}</option>
                  <option>{INVOICE_STATUS.PARTIALLY_PAID}</option>
                  <option>{INVOICE_STATUS.PAID}</option>
                  <option>{INVOICE_STATUS.OVERDUE}</option>
                  <option>{INVOICE_STATUS.CANCELLED}</option>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue From</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue To</label>
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
                  <option value="DueSoon">Due soon</option>
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
                <button
                  onClick={() => alert('Create Invoice coming soon')}
                  className="inline-flex items-center px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow hover:shadow-lg transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Bulk actions (if selection) */}
          {selectedIds.size > 0 && (
            <div className="mb-4 bg-white rounded-2xl border border-gray-100 shadow p-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">
                {selectedIds.size} selected
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={bulkSend}
                  className="px-3 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold inline-flex items-center"
                >
                  <Send className="h-4 w-4 mr-1.5" /> Send
                </button>
                <button
                  onClick={bulkMarkPaid}
                  className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold inline-flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Mark Paid
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Invoices Table (desktop) */}
          <div className="hidden md:block bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      onChange={(e) => e.target.checked ? selectAllPage() : clearSelection()}
                      checked={paged.every(p => selectedIds.has(p.id)) && paged.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Dates</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">City</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      No invoices found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
                {paged.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-4 align-top">
                      <input
                        type="checkbox"
                        className="accent-blue-600 mt-1"
                        checked={selectedIds.has(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-black text-gray-900">{inv.id}</div>
                      <div className="text-sm text-gray-500">
                        Order: <span className="font-semibold text-gray-700">{inv.orderId}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Customer: <span className="font-semibold text-gray-700">{inv.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-gray-700">Issued: {formatDate(inv.issueDate)}</div>
                      <div className="text-gray-700">Due: {formatDate(inv.dueDate)}</div>
                      <div className="mt-1">{dueChip(inv)}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <span className="inline-flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                        {inv.city}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-black text-gray-900">SAR {inv.total.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Paid: SAR {inv.amountPaid.toFixed(2)}</div>
                      <div className={`text-sm ${inv.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: SAR {inv.balance.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 inline-flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </button>
                        <button
                          onClick={() => downloadInvoice(inv)}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center transition-all duration-200"
                        >
                          <Download className="h-4 w-4 mr-1.5" /> PDF
                        </button>
                        <button
                          onClick={() => sendInvoice(inv)}
                          className="px-3 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold inline-flex items-center transition-all duration-200"
                        >
                          <Send className="h-4 w-4 mr-1.5" /> Send
                        </button>
                        <button
                          onClick={() => markAsPaid(inv)}
                          disabled={inv.status === INVOICE_STATUS.PAID || inv.status === INVOICE_STATUS.CANCELLED}
                          className={`px-3 py-2 rounded-xl font-semibold inline-flex items-center transition-all duration-200 ${
                            inv.status === INVOICE_STATUS.PAID || inv.status === INVOICE_STATUS.CANCELLED
                              ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" /> Mark Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoices Cards (mobile) */}
          <div className="md:hidden grid grid-cols-1 gap-4 sm:gap-6">
            {paged.length === 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 text-center text-gray-500">
                No invoices found. Try adjusting your filters.
              </div>
            )}

            {paged.map((inv) => (
              <div key={inv.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-black text-gray-900 text-lg">{inv.id}</div>
                    <div className="text-gray-500 text-sm">Order: {inv.orderId}</div>
                    <div className="text-gray-500 text-sm">{inv.customer}</div>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-500">Issued</div>
                  <div className="font-semibold text-gray-800">{formatDate(inv.issueDate)}</div>
                  <div className="text-gray-500">Due</div>
                  <div className="font-semibold text-gray-800">{formatDate(inv.dueDate)} <span className="ml-1">{dueChip(inv)}</span></div>
                  <div className="text-gray-500">City</div>
                  <div className="font-semibold text-gray-800 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" /> {inv.city}
                  </div>
                  <div className="text-gray-500">Total</div>
                  <div className="font-black text-gray-900">SAR {inv.total.toFixed(2)}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="flex-1 px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 inline-flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1.5" /> View
                  </button>
                  <button
                    onClick={() => downloadInvoice(inv)}
                    className="flex-1 px-4 py-2 rounded-2xl font-semibold inline-flex items-center justify-center transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow"
                  >
                    <Download className="h-4 w-4 mr-1.5" /> PDF
                  </button>
                  <button
                    onClick={() => markAsPaid(inv)}
                    disabled={inv.status === INVOICE_STATUS.PAID || inv.status === INVOICE_STATUS.CANCELLED}
                    className={`flex-1 px-4 py-2 rounded-2xl font-semibold inline-flex items-center justify-center transition-all duration-200 ${
                      inv.status === INVOICE_STATUS.PAID || inv.status === INVOICE_STATUS.CANCELLED
                        ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" /> Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-gray-600 text-sm">
              Showing {(page - 1) * pageSize + (filtered.length ? 1 : 0)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} invoices
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
        </div>
      </section>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedInvoice(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-3xl w-full p-6 sm:p-8 z-[61]">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

            <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-gray-500">Invoice</div>
                <div className="text-2xl font-black text-gray-900">{selectedInvoice.id}</div>
                <div className="text-sm text-gray-500">Order: {selectedInvoice.orderId}</div>
                <div className="text-sm text-gray-500">{formatDate(selectedInvoice.issueDate)} • Due {formatDate(selectedInvoice.dueDate)}</div>
              </div>
              <div className="flex items-center gap-2">
                <InvoiceStatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-bold text-gray-500">Customer</div>
                <div className="font-semibold text-gray-900">{selectedInvoice.customer}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-500">Delivery</div>
                <div className="font-semibold text-gray-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                  {selectedInvoice.city}
                </div>
                <div className="text-gray-600">{selectedInvoice.address}</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-black text-gray-900">Items</div>
                <div className="text-sm text-gray-500">
                  Tax {Math.round(selectedInvoice.taxRate * 100)}%
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedInvoice.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{it.name}</div>
                      <div className="text-sm text-gray-500">Qty: {it.qty} {it.unit} × SAR {it.unitPrice}</div>
                    </div>
                    <div className="font-bold text-gray-900">SAR {(it.qty * it.unitPrice).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-bold text-gray-500">Subtotal</div>
                  <div className="font-semibold text-gray-900">SAR {selectedInvoice.subtotal.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="font-bold text-gray-500">VAT ({Math.round(selectedInvoice.taxRate*100)}%)</div>
                  <div className="font-semibold text-gray-900">SAR {selectedInvoice.tax.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <div className="font-black text-gray-900">Total</div>
                  <div className="text-xl font-black text-gray-900">SAR {selectedInvoice.total.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-100 rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-500">Paid</div>
                  <div className="text-base font-black text-green-700">SAR {selectedInvoice.amountPaid.toFixed(2)}</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-500">Balance</div>
                  <div className={`text-base font-black ${selectedInvoice.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    SAR {selectedInvoice.balance.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-500">Paid %</div>
                  <div className="text-base font-black text-gray-900">{selectedInvoice.paidPercent}%</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => downloadInvoice(selectedInvoice)}
                className="px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => sendInvoice(selectedInvoice)}
                className="px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800"
              >
                <Send className="h-5 w-5 mr-2" />
                Send to Customer
              </button>
              <button
                onClick={() => markAsPaid(selectedInvoice)}
                disabled={selectedInvoice.status === INVOICE_STATUS.PAID || selectedInvoice.status === INVOICE_STATUS.CANCELLED}
                className={`px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 ${
                  selectedInvoice.status === INVOICE_STATUS.PAID || selectedInvoice.status === INVOICE_STATUS.CANCELLED
                    ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow'
                }`}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Paid
              </button>
              <button
                onClick={() => alert('Print coming soon')}
                className="px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print
              </button>
              <button
                onClick={() => alert('Edit invoice coming soon')}
                className="px-5 py-3 rounded-2xl font-bold inline-flex items-center transition-all duration-200 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
