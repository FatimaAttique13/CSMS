import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

import { 
  Truck, 
  FileText, 
  Mountain, 
  Factory, 
  Search, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  Package,
  Shield,
  Zap,
  Star,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Settings,
  Menu,
  X,
  ChevronDown,
  Filter,
  Grid,
  List,
  ShoppingCart,
  Plus,
  Minus,
  Eye,
  Heart,
  Share2,
  AlertTriangle,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Archive,
  PackageCheck,
  AlertCircle,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Warehouse
} from 'lucide-react';

const InventoryPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false); // Fix hydration

  // Add New Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newItem, setNewItem] = useState({
    name: '', sku: '', category: 'cement', description: '', unit: 'bags', 
    unitPrice: 0, taxRate: 0.15, stockQuantity: 0, reorderLevel: 0, 
    isActive: true, supplier: '', location: ''
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetAddForm = () => {
    setNewItem({
      name: '', sku: '', category: 'cement', description: '', unit: 'bags',
      unitPrice: 0, taxRate: 0.15, stockQuantity: 0, reorderLevel: 0,
      isActive: true, supplier: '', location: ''
    });
    setCurrentStep(1);
    setAddError(null);
    setAddSuccess(false);
  };

  // API integration for products
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fix hydration by only rendering dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const products = Array.isArray(data.products) ? data.products : data;
        console.log('✅ Products fetched from DB:', products.length, 'items');
        setApiProducts(products.map(mapProductToInventoryItem));
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('❌ Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const mapProductToInventoryItem = (product: any) => ({
    id: product._id || product.id,
    name: product.name,
    category: product.category || 'other',
    sku: product.sku || 'N/A',
    currentStock: product.stockQuantity || 0,
    minStock: product.reorderLevel || 0,
    maxStock: (product.reorderLevel || 0) * 4,
    unit: product.unit || 'units',
    costPerUnit: product.unitPrice || 0,
    value: (product.stockQuantity || 0) * (product.unitPrice || 0),
    supplier: product.metadata?.supplier || 'Not specified',
    location: product.metadata?.location || 'Main Warehouse',
    lastUpdated: new Date().toISOString().split('T')[0],
    status: (product.stockQuantity || 0) === 0 ? 'out_of_stock' : 
            (product.stockQuantity || 0) <= (product.reorderLevel || 0) ? 'low_stock' : 'in_stock',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80',
    _apiProduct: product
  });

  // Dynamic categories from DB products
  const categories = React.useMemo(() => {
    const categoryCounts = apiProducts.reduce((acc: any, item: any) => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const cats = [
      { id: 'all', name: 'All Items', count: apiProducts.length }
    ];

    Object.keys(categoryCounts).forEach(cat => {
      cats.push({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: categoryCounts[cat]
      });
    });

    return cats;
  }, [apiProducts]);

  const createProduct = async (productData: any): Promise<{ success: boolean; error?: string; product?: any }> => {
    try {
      console.log('📤 Sending product data to API:', productData);
      
      // Prepare data for API (include metadata for supplier/location)
      const apiData = {
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        description: productData.description,
        unit: productData.unit,
        unitPrice: productData.unitPrice,
        taxRate: productData.taxRate,
        stockQuantity: productData.stockQuantity,
        reorderLevel: productData.reorderLevel,
        isActive: productData.isActive,
        metadata: {
          supplier: productData.supplier || 'Not specified',
          location: productData.location || 'Main Warehouse'
        }
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Product added successfully to database:', result.product);
        return { success: true, product: result.product };
      } else {
        const error = await response.json();
        console.error('❌ Failed to add product:', error);
        return { success: false, error: error.error || 'Failed to create product' };
      }
    } catch (err) {
      console.error('❌ Network error while adding product:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const updateProduct = async (id: string, updates: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        await fetchProducts(); // Refresh list
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to update product' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchProducts(); // Refresh list
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to delete product' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleting(true);
    const result = await deleteProduct(itemToDelete.id);
    setDeleting(false);
    
    if (result.success) {
      setShowDeleteModal(false);
      setItemToDelete(null);
      // Show success message (you can add a toast notification here)
      alert('Product deleted successfully!');
    } else {
      alert(`Failed to delete product: ${result.error}`);
    }
  };

  const adjustStock = async (id: string, adjustment: number, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/products/${id}/adjust-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment, reason })
      });
      
      if (response.ok) {
        await fetchProducts(); // Refresh list
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to adjust stock' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  // Use only DB products - no hardcoded fallback
  let allItems: any[] = apiProducts;
  if (justAddedId && allItems.length > 0) {
    const idx = allItems.findIndex(i => 
      String(i.id) === String(justAddedId) || 
      (i._id && String(i._id) === String(justAddedId))
    );
    if (idx > 0) {
      const item = allItems[idx];
      allItems = [item, ...allItems.slice(0, idx), ...allItems.slice(idx + 1)];
    }
  }

  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = showLowStock ? (item.status === 'low_stock' || item.status === 'out_of_stock') : true;
    return matchesCategory && matchesSearch && matchesStock;
  });

  const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0);
  const lowStockCount = allItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-orange-600 bg-orange-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="h-4 w-4" />;
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />;
      case 'out_of_stock': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  interface InventoryItem {
    id?: string | number;
    _id?: string;
    name: string;
    category: string;
    sku: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    costPerUnit: number;
    value: number;
    supplier: string;
    location: string;
    lastUpdated: string;
    status: string;
    image: string;
    _apiProduct?: any;
  }

  const InventoryCard = ({ item, isListView = false }: { item: InventoryItem; isListView?: boolean }) => (
    <div className={`group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden ${isListView ? 'flex items-center p-6' : 'p-8'}`}>
      {/* Image */}
      <div className={`relative overflow-hidden ${isListView ? 'w-24 h-24 flex-shrink-0 mr-6' : 'w-full h-48 mb-6'} rounded-2xl`}>
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Only show "New" badge after component is mounted (fixes hydration) */}
        {mounted && (String(item.id) === String(justAddedId) || (item._id && String(item._id) === String(justAddedId))) && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">New</span>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
        </div>
      </div>

      <div className={`${isListView ? 'flex-1' : ''}`}>
        <div className={`${isListView ? 'flex items-start justify-between' : ''}`}>
          <div className={`${isListView ? 'flex-1 pr-6' : ''}`}>
            {/* Header Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {item.sku}
                </span>
                <span className="text-gray-500 text-sm">{item.location}</span>
              </div>
              <h3 className={`font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 ${isListView ? 'text-xl' : 'text-2xl'}`}>
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm">{item.supplier}</p>
            </div>

            {/* Stock Information */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Current Stock:</span>
                <span className="font-bold text-xl text-gray-900">{item.currentStock.toLocaleString()} {item.unit}</span>
              </div>
              
              {/* Stock Level Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    item.status === 'out_of_stock' ? 'bg-red-500' :
                    item.status === 'low_stock' ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-semibold">
                  <span className="text-gray-600">Min: {item.minStock}</span>
                  <span className="text-gray-600">Max: {item.maxStock}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-gray-500 mb-1">Unit Cost</div>
                  <div className="font-bold text-gray-900">SAR {item.costPerUnit}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="text-gray-500 mb-1">Total Value</div>
                  <div className="font-bold text-blue-600">SAR {item.value.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`${isListView ? 'flex flex-col gap-2 w-32' : 'flex gap-2'}`}>
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center">
              <Plus className="h-4 w-4 mr-1" />
              Restock
            </button>
            <button 
              onClick={() => handleDeleteClick(item)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Glassmorphic Navbar */}
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
                <Link href="/admin/analytics" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Analytics</Link>
                <Link href="/admin/invoices" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Invoices</Link>
                <Link href="/admin/inventory" className="px-4 py-2 text-blue-600 font-medium transition-all duration-300 rounded-full bg-white/40 text-sm">Inventory</Link>
                <Link href="/admin/reports" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Reports</Link>
                <Link href="/" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">Exit</Link>
              </div>

              {/* Auth Buttons */}
              {!user ? (
                <div className="hidden lg:flex items-center space-x-3">
                  <Link href="/login" className="text-black-800 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-white/40 transition-all duration-300 text-sm">Login</Link>
                  <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm">Get Started</Link>
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
        </div>
      </header>

      {/* Inventory Management Section */}
      <section className="pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Inventory Management
            </h1>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Real-time inventory tracking and management for all construction materials across warehouses.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Warehouse className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900">{filteredItems.length}</div>
                  <div className="text-gray-500 font-semibold">Total Items</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Active inventory items</div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900">SAR {totalValue.toLocaleString()}</div>
                  <div className="text-gray-500 font-semibold">Total Value</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Current inventory value</div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-10 w-10 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900">{lowStockCount}</div>
                  <div className="text-gray-500 font-semibold">Low Stock</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Items need restocking</div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-10 w-10 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900">98%</div>
                  <div className="text-gray-500 font-semibold">Fill Rate</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">Order fulfillment rate</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 sm:mb-10 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-base sm:text-lg font-medium"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setShowLowStock(!showLowStock)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center ${
                    showLowStock 
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Low Stock
                </button>

                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white shadow-md' : ''
                    }`}
                  >
                    <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'list' ? 'bg-white shadow-md' : ''
                    }`}
                  >
                    <List className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
                onClick={() => setShowAddModal(true)}
                disabled={adding}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Item
              </button>
              <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Import CSV
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Export Data
              </button>
              <button 
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 flex items-center"
                onClick={async () => {
                  console.log('🔄 Syncing inventory from database...');
                  await fetchProducts();
                  console.log('✅ Inventory synced successfully!');
                }}
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync Inventory
              </button>
            </div>
          </div>

          {/* Inventory Items */}
          {loading ? (
            <div className="text-center py-16 sm:py-20">
              <div className="bg-blue-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Loading inventory...</h3>
              <p className="text-gray-600 text-lg">Fetching data from database</p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8' 
                : 'space-y-4 sm:space-y-6'
              }>
                {filteredItems.map(item => (
                  <InventoryCard 
                    key={item.id} 
                    item={item} 
                    isListView={viewMode === 'list'} 
                  />
                ))}
              </div>

              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-16 sm:py-20">
                  <div className="bg-gray-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No items in inventory</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    {searchTerm || selectedCategory !== 'all' || showLowStock 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Start by adding your first product to the inventory'}
                  </p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 inline mr-2" />
                    Add First Product
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">Inventory Tools</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Advanced tools to streamline your inventory management and optimize stock levels.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full -mr-20 -mt-20"></div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <PackageCheck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Stock Alerts</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Automated notifications when inventory reaches minimum levels. Never run out of critical materials again.
              </p>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Active Alerts:</span>
                  <span className="font-bold text-orange-600">{lowStockCount}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Alert Threshold:</span>
                  <span className="font-bold text-gray-700">20% of max stock</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center text-lg group-hover:scale-105 shadow-lg">
                Configure Alerts <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20"></div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Comprehensive insights into inventory turnover, usage patterns, and optimization opportunities.
              </p>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Avg Turnover:</span>
                  <span className="font-bold text-blue-600">45 days</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Top Category:</span>
                  <span className="font-bold text-gray-700">Cement</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center text-lg group-hover:scale-105 shadow-lg">
                View Full Analytics <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full -mr-20 -mt-20"></div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Settings className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Auto Reorder</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Set up automatic reordering based on consumption patterns and lead times for seamless operations.
              </p>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Auto Orders:</span>
                  <span className="font-bold text-green-600">12 active</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Next Order:</span>
                  <span className="font-bold text-gray-700">Mar 30</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center text-lg group-hover:scale-105 shadow-lg">
                Setup Auto Orders <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 sm:py-28 md:py-32 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 sm:mb-10 px-2">Optimize Your Inventory</h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100/90 mb-12 sm:mb-16 max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto font-medium leading-relaxed px-2">
            Take control of your construction material inventory with advanced analytics and automated management tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center px-2">
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl text-xl sm:text-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group">
              <Plus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300" />
              Add New Items
            </button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl text-xl sm:text-2xl font-bold hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center group">
              <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300" />
              View Analytics
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-2xl shadow-lg">
                  <Factory className="h-10 w-10 text-white" />
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">CSMS</span>
                  <p className="text-gray-400 font-semibold text-base sm:text-lg">Supply Management System</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md text-base sm:text-lg">
                Saudi Arabia's premier digital platform revolutionizing construction material procurement through innovative technology and exceptional service.
              </p>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Proudly serving Jeddah & Makkah</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-8 text-white">Quick Access</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-base sm:text-lg font-medium hover:translate-x-1 transform inline-block">Place Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-base sm:text-lg font-medium hover:translate-x-1 transform inline-block">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-base sm:text-lg font-medium hover:translate-x-1 transform inline-block">Order History</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-base sm:text-lg font-medium hover:translate-x-1 transform inline-block">Invoice Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-base sm:text-lg font-medium hover:translate-x-1 transform inline-block">About CSMS</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8 text-white">Our Products</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center group">
                  <Package className="h-5 w-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <a href="#" className="hover:text-white transition-colors duration-300 text-lg font-medium">Premium Cement</a>
                </li>
                <li className="flex items-center group">
                  <Mountain className="h-5 w-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <a href="#" className="hover:text-white transition-colors duration-300 text-lg font-medium">Quality Aggregate</a>
                </li>
                <li className="flex items-center group">
                  <Factory className="h-5 w-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <a href="#" className="hover:text-white transition-colors duration-300 text-lg font-medium">Construction Sand</a>
                </li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-lg font-medium hover:translate-x-1 transform inline-block">Bulk Solutions</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 text-lg font-medium hover:translate-x-1 transform inline-block">Custom Orders</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8 text-white">Contact Us</h3>
              <div className="space-y-6 text-gray-400">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 mr-4 text-blue-400 mt-1" />
                  <div>
                    <p className="font-bold text-white text-lg">+966 12 123 4567</p>
                    <p className="font-medium">24/7 Customer Support</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-6 w-6 mr-4 text-blue-400 mt-1" />
                  <div>
                    <p className="font-bold text-white text-lg">orders@csms.sa</p>
                    <p className="font-medium">Order Support & Inquiries</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-4 text-blue-400 mt-1" />
                  <div>
                    <p className="font-bold text-white text-lg">King Abdullah Road</p>
                    <p className="font-medium">Jeddah, Saudi Arabia 21589</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 mr-4 text-blue-400 mt-1" />
                  <div>
                    <p className="font-bold text-white text-lg">Sunday - Thursday</p>
                    <p className="font-medium">7:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-8 sm:pt-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-400 text-lg font-medium">
                &copy; 2024 CSMS - Cement Supply Management System. All rights reserved.
              </p>
              <div className="flex items-center space-x-8 mt-6 md:mt-0 text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300 font-medium text-lg">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-300 font-medium text-lg">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-300 font-medium text-lg">Support Center</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add New Item Modal - Enhanced UI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-slideUp">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Add New Inventory Item</h2>
                  <p className="text-blue-100 text-sm">Step {currentStep} of 3</p>
                </div>
              </div>
              <button 
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-200"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-8">
                {[
                  { num: 1, label: 'Basic Info', icon: FileText },
                  { num: 2, label: 'Pricing & Stock', icon: Package },
                  { num: 3, label: 'Details', icon: Settings }
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        currentStep >= step.num 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step.num ? <CheckCircle className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                      </div>
                      <span className={`text-sm font-semibold ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1);
                  return;
                }
                
                setAdding(true);
                setAddError(null);
                
                console.log('🚀 Starting to add new product...');
                const res = await createProduct(newItem);
                
                if (res.success) {
                  console.log('✅ Product added successfully!');
                  setAddSuccess(true);
                  setJustAddedId(res.product?._id || res.product?.id || null);
                  
                  // Fetch products to update the list dynamically
                  await fetchProducts();
                  console.log('✅ Product list refreshed - new item should appear at the top');
                  
                  setTimeout(() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }, 2000);
                } else {
                  console.error('❌ Error adding product:', res.error);
                  setAddError(res.error || 'Failed to add item');
                }
                setAdding(false);
              }}
              className="px-6 pb-6"
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g., Premium Portland Cement" 
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                      value={newItem.name} 
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">SKU Code *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., CEM-001" 
                        className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium uppercase"
                        value={newItem.sku} 
                        onChange={e => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        required
                        className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                        value={newItem.category}
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      >
                        <option value="cement">Cement</option>
                        <option value="aggregate">Aggregate</option>
                        <option value="sand">Sand</option>
                        <option value="other">Other Materials</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                      placeholder="Enter product description..." 
                      rows={3}
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium resize-none"
                      value={newItem.description} 
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })} 
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Pricing & Stock */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Unit Type *</label>
                      <select
                        required
                        className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                        value={newItem.unit}
                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                      >
                        <option value="bags">Bags (50kg)</option>
                        <option value="tons">Tons</option>
                        <option value="kg">Kilograms</option>
                        <option value="m3">Cubic Meters</option>
                        <option value="units">Units</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Unit Price (SAR) *</label>
                      <input 
                        type="number" 
                        required 
                        min="0" 
                        step="0.01"
                        placeholder="0.00" 
                        className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                        value={newItem.unitPrice || ''} 
                        onChange={e => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tax Rate (Decimal)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.01"
                      placeholder="0.15" 
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                      value={newItem.taxRate} 
                      onChange={e => setNewItem({ ...newItem, taxRate: Number(e.target.value) })} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Default: 0.15 (15% VAT)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity *</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        placeholder="0" 
                        className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                        value={newItem.stockQuantity || ''} 
                        onChange={e => setNewItem({ ...newItem, stockQuantity: Number(e.target.value) })} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Reorder Level *</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        placeholder="0" 
                        className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                        value={newItem.reorderLevel || ''} 
                        onChange={e => setNewItem({ ...newItem, reorderLevel: Number(e.target.value) })} 
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">Stock Alert</p>
                        <p>You'll receive notifications when stock falls below the reorder level.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Details */}
              {currentStep === 3 && !addSuccess && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Supplier Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Saudi Cement Co." 
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                      value={newItem.supplier} 
                      onChange={e => setNewItem({ ...newItem, supplier: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Storage Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Warehouse A-1" 
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                      value={newItem.location} 
                      onChange={e => setNewItem({ ...newItem, location: e.target.value })} 
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-4 focus:ring-blue-500/20"
                      checked={newItem.isActive} 
                      onChange={e => setNewItem({ ...newItem, isActive: e.target.checked })} 
                    />
                    <label htmlFor="isActive" className="font-semibold text-gray-700 cursor-pointer">
                      Item is active and available for ordering
                    </label>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-6">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Review Your Item
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Product Name</p>
                        <p className="font-bold text-gray-900">{newItem.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">SKU</p>
                        <p className="font-bold text-gray-900">{newItem.sku || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Category</p>
                        <p className="font-bold text-gray-900 capitalize">{newItem.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Unit Price</p>
                        <p className="font-bold text-blue-600">SAR {newItem.unitPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Stock Quantity</p>
                        <p className="font-bold text-gray-900">{newItem.stockQuantity} {newItem.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Status</p>
                        <p className={`font-bold ${newItem.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {newItem.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {addError && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="font-bold">{addError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Success State */}
              {addSuccess && (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Item Added Successfully!</h3>
                  <p className="text-gray-600 text-lg">Your new inventory item has been created.</p>
                </div>
              )}

              {/* Footer Actions */}
              {!addSuccess && (
                <div className="flex gap-3 mt-8">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={adding}
                  >
                    {adding ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Adding Item...
                      </>
                    ) : currentStep < 3 ? (
                      <>
                        Continue
                        <ChevronRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Add to Inventory
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Item?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold">{itemToDelete.name}</span>? 
                This action will mark the item as inactive.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;