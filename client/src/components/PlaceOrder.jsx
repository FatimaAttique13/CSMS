'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { 
  Factory, 
  CheckCircle, 
  MapPin,
  Menu,
  X,
  ArrowRight,
  ShoppingCart,
  Minus,
  Plus
} from 'lucide-react';

/* ---------- Main Component ---------- */

const PlaceOrder = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart, openCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch complete user details on mount (waits for auth to finish)
  useEffect(() => {
    if (authLoading) return;

    const fetchUserDetails = async () => {
      // Determine email source: AuthContext or localStorage fallback
      let email = user?.email;
      if (!email) {
        try {
          const raw = localStorage.getItem('csms_user');
          if (raw) email = JSON.parse(raw).email;
        } catch {}
      }

      if (!email) {
        // No user email available – keep user on page and let button guard handle it
        setLoadingUser(false);
        return;
      }

      try {
        // Check cache first
        const cachedUser = sessionStorage.getItem('user_details_cache');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          const cacheAge = Date.now() - parsed.timestamp;
          if (cacheAge < 5 * 60 * 1000) {
            setUserDetails(parsed.data);
            setLoadingUser(false);
            return;
          }
        }

        // Fetch from API
        const response = await fetch(`/api/auth/verify?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;

          // Cache the user data
          sessionStorage.setItem('user_details_cache', JSON.stringify({
            data: userData,
            timestamp: Date.now()
          }));

          // Update localStorage with complete user data (keeps any existing props)
          try {
            const existing = localStorage.getItem('csms_user');
            const merged = existing ? { ...JSON.parse(existing), ...{
              _id: userData._id,
              email: userData.email,
              role: userData.role,
              name: userData.fullName || userData.profile?.firstName || user?.name
            }} : {
              _id: userData._id,
              email: userData.email,
              role: userData.role,
              name: userData.fullName || userData.profile?.firstName
            };
            localStorage.setItem('csms_user', JSON.stringify(merged));
          } catch {}

          setUserDetails(userData);
        } else {
          console.error('Failed to fetch user details:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, [authLoading, user?.email]);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/products');
    }
  }, [cart, router]);

  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Jeddah',
    deliveryDate: '',
    notes: ''
  });

  // Update order details when user details are loaded
  useEffect(() => {
    if (userDetails) {
      setOrderDetails(prev => ({
        ...prev,
        customerName: userDetails.fullName || userDetails.profile?.firstName || prev.customerName,
        email: userDetails.email || prev.email,
        phone: userDetails.profile?.phone || prev.phone,
        address: userDetails.addresses?.[0]?.line1 || prev.address,
        city: userDetails.addresses?.[0]?.city || prev.city
      }));
    }
  }, [userDetails]);

  const handleOrderDetailChange = useCallback((e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  }, []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const shippingCost = 5.0;
  const finalTotal = totalPrice + shippingCost;

  const canProceed = () => {
    return !!(
      orderDetails.customerName &&
      orderDetails.phone &&
      orderDetails.address &&
      orderDetails.deliveryDate &&
      cart.length > 0
    );
  };

  // Ensure a default delivery date is set to today if empty
  useEffect(() => {
    if (!orderDetails.deliveryDate) {
      setOrderDetails(prev => ({ ...prev, deliveryDate: today }));
    }
  }, [today, orderDetails.deliveryDate]);

  const handleConfirmOrder = async () => {
    if (!canProceed()) return;
    
    // Prefer id if available, but also pass email so API can resolve
    const customerId = userDetails?._id;
    
    setIsProcessing(true);
    try {
      // Resolve account email from multiple sources - prioritize authenticated user email
      let accountEmail = (userDetails?.email || user?.email || '').trim();
      if (!accountEmail) {
        try {
          const raw = localStorage.getItem('csms_user');
          if (raw) accountEmail = (JSON.parse(raw).email || '').trim();
        } catch {}
      }
      // Only use form email if no authenticated email found
      if (!accountEmail) {
        accountEmail = (orderDetails.email || '').trim();
      } else {
        // Override form email with authenticated email to prevent mismatch
        console.log('Using authenticated email:', accountEmail, 'instead of form email:', orderDetails.email);
      }

      const orderData = {
        customerId,
        customerEmail: accountEmail,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        // Map to Order schema: line1, line2, city, notes
        deliveryAddress: {
          line1: orderDetails.address,
          line2: '',
          city: orderDetails.city,
          notes: orderDetails.notes
        },
        deliveryETA: orderDetails.deliveryDate,
        metadata: {
          email: orderDetails.email,
          notes: orderDetails.notes
        }
      };

      console.log('Placing order with data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Order API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      // Clear cache on successful order
      sessionStorage.removeItem('user_details_cache');
      
      clearCart();
      alert('Order placed successfully! Order Number: ' + data.order.orderNumber);
      router.push('/orders/track');
    } catch (error) {
      console.error('Order error:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Shopping Cart
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-gray-600 font-medium">
              {totalItems} Item{totalItems !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">PRODUCT DETAILS</h2>
                
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.unit}</p>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-white border border-gray-300 p-2 rounded-lg hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-white border border-gray-300 p-2 rounded-lg hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            SAR {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">SAR {item.price} each</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Delivery Details</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={orderDetails.customerName}
                      onChange={handleOrderDetailChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={orderDetails.email}
                      onChange={handleOrderDetailChange}
                      readOnly={!!(userDetails?.email || user?.email)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="your.email@example.com"
                      title={userDetails?.email || user?.email ? "Email from your account" : ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={orderDetails.phone}
                      onChange={handleOrderDetailChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="+966 XX XXX XXXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                    <select
                      name="city"
                      value={orderDetails.city}
                      onChange={handleOrderDetailChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="Jeddah">Jeddah</option>
                      <option value="Makkah">Makkah</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address *</label>
                    <textarea
                      name="address"
                      value={orderDetails.address}
                      onChange={handleOrderDetailChange}
                      rows="3"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Enter complete delivery address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={orderDetails.deliveryDate}
                      onChange={handleOrderDetailChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      min={today}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={orderDetails.notes}
                      onChange={handleOrderDetailChange}
                      rows="3"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Special instructions"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">ITEMS {totalItems}</span>
                    <span className="font-bold">SAR {totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">SHIPPING</span>
                      <button className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
                        Standard - SAR {shippingCost.toFixed(2)}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">PROMO CODE</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter your code"
                        className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm">
                        APPLY
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">TOTAL COST</span>
                    <span className="text-2xl font-black text-gray-900">SAR {finalTotal.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={handleConfirmOrder}
                    disabled={!canProceed() || isProcessing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${
                      canProceed() && !isProcessing
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'CHECKOUT'}
                  </button>
                </div>
                
                <button
                  onClick={() => router.push('/products')}
                  className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 py-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlaceOrder;