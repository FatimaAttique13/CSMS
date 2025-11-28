'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
  Plus,
  Minus,
  ShoppingCart,
  Calculator,
  CreditCard,
  User,
  MapIcon,
  NotebookPen
} from 'lucide-react';

/* ---------- Extracted Components (stable identities) ---------- */

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="mb-12 sm:mb-16">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center ${index !== 0 ? 'ml-4 sm:ml-8' : ''}`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                currentStep >= step.id 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 text-white shadow-lg' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center mt-3 max-w-20 sm:max-w-24">
                <p className={`text-xs sm:text-sm font-bold ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block mt-1">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 mt-[-2rem] sm:mt-[-2.5rem] transition-all duration-300 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSelection({ selectedProducts, updateQuantity, setProductQuantity, total, itemsCount }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Select Products</h2>
      
      {selectedProducts.map(product => (
        <div key={product.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-2xl"
            />
            
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">{product.name}</h3>
              <p className="text-lg sm:text-xl font-bold text-blue-600 mb-4">
                SAR {product.price} <span className="text-gray-500 font-medium">{product.unit}</span>
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity(product.id, -1)}
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors duration-200"
                    disabled={product.quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    aria-label={`${product.name} quantity`}
                    className="w-20 text-center font-bold text-xl bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 hide-arrow"
                    value={product.quantity}
                    onChange={(e) => setProductQuantity(product.id, e.target.value)}
                  />
                  <button 
                    onClick={() => updateQuantity(product.id, 1)}
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    SAR {(product.price * product.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Order Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 sm:p-8 border border-blue-200">
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Total Items:</span>
            <span className="font-bold">{itemsCount}</span>
          </div>
          <div className="flex justify-between text-xl sm:text-2xl font-black text-blue-600 pt-2 border-t border-blue-200">
            <span>Total Amount:</span>
            <span>SAR {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryDetails({ orderDetails, onChange, today }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Delivery Details</h2>
      
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className='text-red-400'>*</span></label>
            <input
              type="text"
              name="customerName"
              value={orderDetails.customerName}
              onChange={onChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className='text-red-400'>*</span></label>
            <input
              type="email"
              name="email"
              value={orderDetails.email}
              onChange={onChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className='text-red-400'>*</span></label>
            <input
              type="tel"
              name="phone"
              value={orderDetails.phone}
              onChange={onChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              placeholder="+966 XX XXX XXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">City <span className='text-red-400'>*</span></label>
            <select
              name="city"
              value={orderDetails.city}
              onChange={onChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
            >
              <option value="Jeddah">Jeddah</option>
              <option value="Makkah">Makkah</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address <span className='text-red-400'>*</span></label>
            <textarea
              name="address"
              value={orderDetails.address}
              onChange={onChange}
              rows="3"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              placeholder="Enter complete delivery address with landmarks"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Delivery Date <span className='text-red-400'>*</span></label>
            <input
              type="date"
              name="deliveryDate"
              value={orderDetails.deliveryDate}
              onChange={onChange}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              min={today}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Special Notes (Optional)</label>
            <textarea
              name="notes"
              value={orderDetails.notes}
              onChange={onChange}
              rows="3"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              placeholder="Any special delivery instructions or notes"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewConfirm({ selectedProducts, orderDetails, total }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Review & Confirm Order</h2>
      
      {/* Order Items Review */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-black text-gray-900 mb-4">Order Items</h3>
        {selectedProducts.filter(p => p.quantity > 0).map(product => (
          <div key={product.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-bold text-gray-900">{product.name}</p>
              <p className="text-gray-600">Qty: {product.quantity} × SAR {product.price}</p>
            </div>
            <p className="font-bold text-blue-600">SAR {(product.price * product.quantity).toFixed(2)}</p>
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-2xl font-black text-blue-600">
            <span>Total Amount:</span>
            <span>SAR {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details Review */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-black text-gray-900 mb-4">Delivery Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-gray-500">Customer Name</p>
            <p className="font-bold text-gray-900">{orderDetails.customerName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Email</p>
            <p className="font-bold text-gray-900">{orderDetails.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Phone</p>
            <p className="font-bold text-gray-900">{orderDetails.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">City</p>
            <p className="font-bold text-gray-900">{orderDetails.city}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-bold text-gray-500">Delivery Address</p>
            <p className="font-bold text-gray-900">{orderDetails.address || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Delivery Date</p>
            <p className="font-bold text-gray-900">{orderDetails.deliveryDate || 'Not selected'}</p>
          </div>
          {orderDetails.notes && (
            <div className="md:col-span-2">
              <p className="text-sm font-bold text-gray-500">Special Notes</p>
              <p className="font-bold text-gray-900">{orderDetails.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */

const PlaceOrder = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { user, logout } = useAuth();

  // Fetch products from API
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(p => ({
            id: p._id || p.sku || p.name,
            name: p.name,
            price: typeof p.unitPrice === 'number' ? p.unitPrice : 0,
            unit: p.unit === 'bags' ? 'per 50kg bag' : p.unit === 'tons' ? 'per ton' : `per ${p.unit}`,
            quantity: 0,
            image: p.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80'
          }));
          setSelectedProducts(mapped);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Jeddah',
    deliveryDate: '',
    notes: ''
  });

  // Handlers
  const handleOrderDetailChange = useCallback((e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => (prev[name] === value ? prev : { ...prev, [name]: value }));
  }, []);

  const updateQuantity = useCallback((productId, change) => {
    setSelectedProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, quantity: Math.max(0, product.quantity + change) }
        : product
    ));
  }, []);

  const setProductQuantity = useCallback((productId, value) => {
    const numeric = Number.isNaN(Number(value)) ? 0 : Number(value);
    setSelectedProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, quantity: Math.max(0, numeric) }
        : product
    ));
  }, []);

  // Derived values
  const total = useMemo(() => {
    return selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  }, [selectedProducts]);

  const itemsCount = useMemo(() => {
    return selectedProducts.reduce((count, product) => count + product.quantity, 0);
  }, [selectedProducts]);

  const steps = useMemo(() => ([
    { id: 1, title: 'Select Products', icon: Package, description: 'Choose materials and quantities' },
    { id: 2, title: 'Delivery Details', icon: MapPin, description: 'Provide delivery information' },
    { id: 3, title: 'Review & Confirm', icon: CheckCircle, description: 'Review your order' }
  ]), []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <ProductSelection
            selectedProducts={selectedProducts}
            updateQuantity={updateQuantity}
            setProductQuantity={setProductQuantity}
            total={total}
            itemsCount={itemsCount}
          />
        );
      case 2:
        return (
          <DeliveryDetails
            orderDetails={orderDetails}
            onChange={handleOrderDetailChange}
            today={today}
          />
        );
      case 3:
        return (
          <ReviewConfirm
            selectedProducts={selectedProducts}
            orderDetails={orderDetails}
            total={total}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return itemsCount > 0;
    }
    if (currentStep === 2) {
      return orderDetails.customerName && orderDetails.email && orderDetails.phone && orderDetails.address && orderDetails.deliveryDate;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Glassmorphic Navbar - Same as other pages */}
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
                <Link href="/" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Home
                </Link>
                <Link href="/products" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Products
                </Link>
                <Link href="/place-order" className="px-4 py-2 text-blue-600 font-medium transition-all duration-300 rounded-full bg-white/40 text-sm">
                  Place Order
                </Link>
                <Link href="/track-order" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Track Order
                </Link>
                <Link href="/about" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  About
                </Link>
                <Link href="/contact" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Contact
                </Link>
              </div>

              {/* Auth Buttons */}
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
                  <Link href="/place-order" className="px-4 py-3 text-blue-600 bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Place Order
                  </Link>
                  <Link href="/track-order" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Track Order
                  </Link>
                  <Link href="/about" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    About
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
                    <div className="pt-4 border-t border-white/20">
                      <button onClick={() => logout()} className="w-full text-center text-gray-800 hover:text-blue-600 font-medium px-4 py-3 rounded-2xl hover:bg-white/40 transition-all duration-300 border border-white/30">Logout</button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section className="pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Place Your Order
            </h1>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Get premium construction materials delivered to your site with our streamlined ordering process.
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
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
              <div className="mb-12">
                {renderCurrentStep()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Previous Step
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center ${
                      canProceed()
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next Step
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    disabled={!canProceed()}
                    onClick={async () => {
                      if (!canProceed()) return;
                      try {
                        const items = selectedProducts.filter(p => p.quantity > 0).map(p => ({ name: p.name, unitPrice: p.price, quantity: p.quantity }));
                        const res = await fetch('/api/payments/create-checkout-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items, customerEmail: orderDetails.email })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
                        window.location.href = data.url;
                      } catch (e) {
                        alert(e.message || 'Payment initialization failed');
                      }
                    }}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center ${
                      canProceed()
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirm Order
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default PlaceOrder;