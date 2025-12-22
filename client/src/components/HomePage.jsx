"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronDown
} from 'lucide-react';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirect admin users to admin analytics
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.replace('/admin/analytics');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, Segoe UI, system-ui, sans-serif' }}>
      {/* Pill-Shaped Glassy Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <nav className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-full shadow-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-all duration-500 hover:bg-white/25 hover:shadow-3xl">
            <div className="flex justify-between items-center gap-2">
              {/* Compact Logo for Pill Navbar */}
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
            
              {/* Pill Navbar Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                <a href="#" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Home
                </a>
              
              {/* Enhanced Dropdown */}
              <div className="relative group">
                <Link 
                  href="/products"
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
                    <Link href="/products" className="flex items-center text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-blue-100/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer group/item">
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl mr-4 group-hover/item:from-blue-200 group-hover/item:to-blue-300 transition-all duration-300 shadow-sm">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base mb-1">Premium Cement</p>
                        <p className="text-sm text-gray-500">Bulk & bagged solutions for all projects</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors duration-300" />
                    </Link>
                    <Link href="/products" className="flex items-center text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer group/item">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl mr-4 group-hover/item:from-gray-200 group-hover/item:to-gray-300 transition-all duration-300 shadow-sm">
                        <Mountain className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base mb-1">Quality Aggregate</p>
                        <p className="text-sm text-gray-500">Various grades & sizes available</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors duration-300" />
                    </Link>
                    <Link href="/products" className="flex items-center text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-amber-50/70 hover:to-amber-100/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer group/item">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl mr-4 group-hover/item:from-amber-200 group-hover/item:to-amber-300 transition-all duration-300 shadow-sm">
                        <Factory className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base mb-1">Construction Sand</p>
                        <p className="text-sm text-gray-500">Fine & coarse varieties in stock</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 transition-colors duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
                
                <Link href="/orders/place" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Place Order
                </Link>
                <Link href="/orders/track" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Track Order
                </Link>
                <Link href="/#about" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  About
                </Link>
                <Link href="/#contact" className="px-4 py-2 text-black-800 hover:text-blue-600 font-medium transition-all duration-300 rounded-full hover:bg-white/40 text-sm">
                  Contact
                </Link>
              </div>

              {/* Pill Navbar CTA Buttons */}
              {!user ? (
                <div className="hidden lg:flex items-center space-x-3">
                  <Link href="/login" className="text-black-800 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-white/40 transition-all duration-300 text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm">
                    Sign Up
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
                  <Link href="/products" className="px-4 py-3 text-black-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Products
                  </Link>
                  <Link href="/orders/place" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Place Order
                  </Link>
                  <Link href="/orders/track" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Track Order
                  </Link>
                  <Link href="/#about" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    About
                  </Link>
                  <Link href="/#contact" className="px-4 py-3 text-gray-800 hover:text-blue-600 hover:bg-white/40 rounded-2xl font-medium transition-all duration-300">
                    Contact
                  </Link>
                  {!user ? (
                    <div className="pt-4 space-y-3 border-t border-white/20">
                      <Link href="/login" className="w-full text-center text-gray-800 hover:text-blue-600 font-medium px-4 py-3 rounded-2xl hover:bg-white/40 transition-all duration-300 border border-white/30">
                        Login
                      </Link>
                      <Link href="/signup" className="w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg">
                        Sign Up
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

      {/* Enhanced Hero Section with Construction Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-36 sm:pt-40 md:pt-48 lg:pt-52">
        {/* Construction Site Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/90 to-slate-900/95 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <div className="text-center">
            <div className="mb-10 sm:mb-14 mt-4 sm:mt-8">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-sm font-bold uppercase tracking-wider shadow-xl whitespace-nowrap">
                Saudi Arabia's #1 Supply Platform
              </span>
            </div>
            <h1 className="text-2.5xl text-[1.9rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-[1.15] sm:leading-tight px-1">
              Smart Supply of
              <span className="bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent block mt-1 sm:mt-2"> Construction Materials</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-10 sm:mb-12 text-blue-100/90 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed font-medium px-2">
              Revolutionary digital platform transforming construction procurement across Jeddah & Makkah. 
              Join 500+ companies experiencing seamless material ordering and delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mb-6 sm:mb-8 px-2">
              <Link href="/orders/place" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 sm:px-8 md:px-12 py-3.5 sm:py-4 md:py-5 rounded-2xl text-base sm:text-lg md:text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                Place Order Now
              </Link>
              <Link href="/orders/track" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-6 sm:px-8 md:px-12 py-3.5 sm:py-4 md:py-5 rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center group">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                Track Your Order
              </Link>
            </div>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-2">
                <Link href="/login" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-2xl text-sm sm:text-base md:text-lg font-semibold hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center">
                  Login
                </Link>
                <Link href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-2xl text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                  Create Account
                </Link>
              </div>
            )}

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto mb-20 sm:mb-28 md:mb-32 px-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-black text-white-20 text-xl sm:text-2xl mb-2">500+</h3>
                <p className="text-blue-200 font-medium text-sm sm:text-base">Monthly Orders</p>
                <p className="text-blue-300/70 text-xs sm:text-sm mt-1">25% Growth</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-black text-xl sm:text-2xl mb-2">100+</h3>
                <p className="text-blue-200 font-medium text-sm sm:text-base">Partner Companies</p>
                <p className="text-blue-300/70 text-xs sm:text-sm mt-1">Trusted Partners</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <Award className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-black text-xl sm:text-2xl mb-2">24/7</h3>
                <p className="text-blue-200 font-medium text-sm sm:text-base">Expert Support</p>
                <p className="text-blue-300/70 text-xs sm:text-sm mt-1">Always Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

  {/* Enhanced About Section */}
  <section id="about" className="scroll-mt-40 py-20 sm:py-28 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20 md:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 sm:mb-8 md:mb-10 px-2">About CSMS Platform</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-8 sm:mb-10 md:mb-12 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed font-medium px-1">
              CSMS revolutionizes construction material supply through cutting-edge digital technology. Our platform seamlessly connects 
              customers with suppliers, enabling streamlined ordering, real-time tracking, automated invoicing, and comprehensive delivery management 
              — transforming how construction companies manage their material procurement across Saudi Arabia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 md:gap-20 items-center">
            <div className="space-y-10 sm:space-y-12">
              <div className="flex items-start space-x-8 group">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-5 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">For Customers</h3>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">Order materials online with smart recommendations, track deliveries in real-time with GPS precision, and manage invoices effortlessly through our intuitive dashboard.</p>
                </div>
              </div>
              <div className="flex items-start space-x-8 group">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Settings className="h-10 w-10 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">For Companies</h3>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">Streamline operations with automated driver assignments, intelligent purchase management, comprehensive analytics, and detailed performance reports.</p>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md md:max-w-none mx-auto">
              {/* Lightly Blurred Background Image */}
              <div 
                className="absolute inset-0 h-96 bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
                  filter: 'blur(0.5px)'
                }}
              ></div>
              
              {/* Overlay (non-blurred) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Sharp Stats overlay */}
              <div className="relative h-96 flex items-end">
                <div className="w-full p-10">
                  <div className="grid grid-cols-2 gap-8 text-white">
                    <div className="text-center p-4">
                      <div className="text-4xl font-black mb-3">99.5%</div>
                      <div className="font-semibold text-lg">Delivery Success</div>
                      <div className="text-sm text-blue-200 mt-2">Industry Leading</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-black mb-3">24hrs</div>
                      <div className="font-semibold text-lg">Avg Delivery</div>
                      <div className="text-sm text-blue-200 mt-2">Express Available</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-black mb-3">50+</div>
                      <div className="font-semibold text-lg">Fleet Trucks</div>
                      <div className="text-sm text-blue-200 mt-2">Modern Fleet</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-black mb-3">2</div>
                      <div className="font-semibold text-lg">Major Cities</div>
                      <div className="text-sm text-blue-200 mt-2">Expanding Soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 sm:mb-8 px-2">Premium Products</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 md:mb-10 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Superior construction materials sourced from certified suppliers, delivered with precision and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 relative overflow-hidden">
              {/* Cement Background Image */}
              <div 
                className="absolute top-0 right-0 w-full h-32 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")'
                }}
              ></div>
              <div className="relative z-10 p-10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Package className="h-10 w-10 text-white" />
                </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Premium Cement</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-base sm:text-lg">
                High-grade Portland cement available in bulk and bagged quantities. Perfect for all construction applications 
                with guaranteed quality standards and express delivery options.
              </p>
              <div className="mb-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Bulk & 50kg bags available</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Same-day delivery option</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Quality certified materials</span>
                </div>
              </div>
              <Link href="/products" className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl text-center">
                Order Cement Now
              </Link>
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 relative overflow-hidden">
              {/* Aggregate/Stone Background Image */}
              <div 
                className="absolute top-0 right-0 w-full h-32 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1544819667-3131c8c8da2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")'
                }}
              ></div>
              <div className="relative z-10 p-10">
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mountain className="h-10 w-10 text-white" />
                </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Quality Aggregate</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-base sm:text-lg">
                Premium crushed stone aggregate in various sizes. Ideal for concrete production, road construction, 
                and foundation work with consistent grading and superior durability.
              </p>
              <div className="mb-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Multiple size grades available</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Washed & clean material</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Volume discounts available</span>
                </div>
              </div>
              <Link href="/products" className="block w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-2xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl text-center">
                Order Aggregate Now
              </Link>
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 relative overflow-hidden">
              {/* Sand Background Image */}
              <div 
                className="absolute top-0 right-0 w-full h-32 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1516534775068-ba3e7458af70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")'
                }}
              ></div>
              <div className="relative z-10 p-10">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Factory className="h-10 w-10 text-white" />
                </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Construction Sand</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-base sm:text-lg">
                Fine and coarse sand varieties suitable for concrete mixing, plastering, and general construction. 
                Clean, properly sieved, and ready for immediate use in your projects.
              </p>
              <div className="mb-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Fine & coarse varieties</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Properly sieved & clean</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">Moisture content controlled</span>
                </div>
              </div>
              <Link href="/products" className="block w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-2xl font-bold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl text-center">
                Order Sand Now
              </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 sm:mb-8 px-2">How Our System Works</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 md:mb-10 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              A streamlined 4-step process designed for maximum efficiency and complete transparency.
            </p>
          </div>
          <div className="relative mb-14 sm:mb-16 md:mb-20 rounded-3xl overflow-hidden">
            {/* Construction Process Background Image */}
            <div 
              className="h-32 bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-900/90"></div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold">Powering Construction Excellence</h3>
                  <p className="text-blue-200 mt-2">From order to delivery - seamlessly integrated</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Package className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black shadow-lg">1</div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Place Order Online</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Browse our comprehensive catalog, select materials with smart recommendations, specify quantities and delivery location with instant pricing.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black shadow-lg">2</div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Order Confirmation</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Our expert admin team reviews and confirms your order within 30 minutes. Driver and delivery truck are automatically assigned with full tracking details.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Truck className="h-12 w-12 text-orange-600" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black shadow-lg">3</div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Express Delivery</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Track your order in real-time with GPS precision as our professional drivers deliver materials to your exact location across Jeddah and Makkah.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <FileText className="h-12 w-12 text-purple-600" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black shadow-lg">4</div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Receive detailed digital invoices instantly. Access comprehensive order history, spending analytics, and performance insights through your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Customer Tools */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 sm:mb-8 px-2">Customer Dashboard</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 md:mb-10 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Advanced tools to streamline your material procurement and maximize operational efficiency.
            </p>
          </div>
          <div className="relative mb-12 sm:mb-14 md:mb-16 rounded-3xl overflow-hidden">
            {/* Construction Management Background */}
            <div 
              className="h-40 bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-blue-900/70 to-gray-900/80"></div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold">Construction Management Made Simple</h3>
                  <p className="text-blue-200 mt-2">Complete control over your material procurement</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20"></div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Real-time Tracking</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Enter your order ID for instant delivery status, live driver location, and precise ETA. Complete transparency with every update.
              </p>
              <div className="mb-8">
                <input 
                  type="text" 
                  placeholder="Enter Order ID..." 
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-lg"
                />
              </div>
              <Link href="/track-order" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center text-lg group-hover:scale-105 shadow-lg">
                Track Order <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gray-500/5 rounded-full -mr-20 -mt-20"></div>
              <div className="bg-gradient-to-br from-gray-600 to-gray-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Invoice Hub</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Access all invoices with advanced filtering. Download PDFs, track payments, and export data seamlessly for accounting integration.
              </p>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">This Month:</span>
                  <span className="font-bold text-gray-700">12 Invoices</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Total Amount:</span>
                  <span className="font-bold text-gray-700">SAR 45,200</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500 font-medium">Pending:</span>
                  <span className="font-bold text-orange-600">SAR 8,500</span>
                </div>
              </div>
              <Link href="/orders" className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-2xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-lg group-hover:scale-105 shadow-lg">
                View All Invoices <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full -mr-20 -mt-20"></div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Smart Reorder</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                One-click reordering with AI-powered recommendations. Set up recurring deliveries and never experience supply shortages again.
              </p>
              <div className="mb-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Last Order:</span>
                    <span className="font-bold text-gray-800">50 bags cement</span>
                  </div>
                  <div className="text-sm text-gray-500">March 15, 2024 • SAR 3,750</div>
                </div>
              </div>
              <Link href="/orders/place" className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center text-lg group-hover:scale-105 shadow-lg">
                Reorder Now <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Benefits */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18 md:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 sm:mb-8 px-2">Why Choose CSMS</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 md:mb-10 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Experience the future of construction material procurement with industry-leading innovation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-5">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Complete orders in under 90 seconds with AI-powered smart suggestions and streamlined checkout process.
              </p>
            </div>

            <div className="text-center group">
            <div className="bg-gradient-to-br from-green-100 to-green-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-5">Total Transparency</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Real-time GPS tracking, live driver contact, instant notifications, and complete delivery visibility at every step.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                <Truck className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-5">Express Delivery</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Same-day delivery guarantee across Jeddah & Makkah with our modern fleet of 50+ professionally managed trucks.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                <FileText className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-5">Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Automated invoicing, advanced spending analytics, and comprehensive reports to optimize your procurement strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18 md:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 sm:mb-8 px-2">Trusted by Leaders</h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6 sm:mb-8 md:mb-10 rounded-full"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-medium px-2">
              Join hundreds of construction companies transforming their material procurement with CSMS.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">ABC Construction Group</h4>
                  <p className="text-gray-600 text-lg">Jeddah • 500+ Employees</p>
                </div>
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-6 w-6 fill-current" />)}
                </div>
              </div>
              <p className="text-gray-700 text-xl leading-relaxed mb-6 font-medium">
                "CSMS has revolutionized our material procurement process. We save 3+ hours daily on ordering and tracking. 
                The real-time delivery updates keep our projects perfectly on schedule."
              </p>
              <div className="text-gray-500 text-lg">
                <span className="font-bold text-gray-700">Ahmed Al-Rashid</span> • Senior Project Manager
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <Factory className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">Modern Builders Ltd</h4>
                  <p className="text-gray-600 text-lg">Makkah • 200+ Employees</p>
                </div>
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-6 w-6 fill-current" />)}
                </div>
              </div>
              <p className="text-gray-700 text-xl leading-relaxed mb-6 font-medium">
                "Outstanding service and reliability! The transparent pricing and automated invoicing have streamlined 
                our accounting. We've reduced material costs by 15% through better planning insights."
              </p>
              <div className="text-gray-500 text-lg">
                <span className="font-bold text-gray-700">Sarah Al-Mahmoud</span> • Operations Director
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-14 sm:mt-16 md:mt-20 bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 text-center">
              <div className="group">
                <div className="text-5xl font-black text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-gray-700 font-bold text-xl mb-2">Monthly Orders</div>
                <div className="text-gray-500 font-medium">Growing 25% monthly</div>
              </div>
              <div className="group">
                <div className="text-5xl font-black text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">100+</div>
                <div className="text-gray-700 font-bold text-xl mb-2">Partner Companies</div>
                <div className="text-gray-500 font-medium">Across Saudi Arabia</div>
              </div>
              <div className="group">
                <div className="text-5xl font-black text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">99.5%</div>
                <div className="text-gray-700 font-bold text-xl mb-2">On-Time Delivery</div>
                <div className="text-gray-500 font-medium">Industry leading rate</div>
              </div>
              <div className="group">
                <div className="text-5xl font-black text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-gray-700 font-bold text-xl mb-2">Expert Support</div>
                <div className="text-gray-500 font-medium">Always available</div>
              </div>
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
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 sm:mb-10 px-2">Ready to Transform?</h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100/90 mb-12 sm:mb-16 max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto font-medium leading-relaxed px-2">
            Join the construction revolution. Experience the future of material procurement with CSMS platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center px-2">
            <Link href="/orders/place" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl text-xl sm:text-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300" />
              Start Your First Order
            </Link>
            <Link href="/#contact" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl text-xl sm:text-2xl font-bold hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center group">
              <Phone className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300" />
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

  {/* Enhanced Footer */}
  <footer id="contact" className="scroll-mt-40 bg-gray-900 text-white py-16 sm:py-20">
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
                <li><Link href="/track-order" className="hover:text-white transition-colors duration-300 text-base sm:text-lg font-medium hover:translate-x-1 transform inline-block">Track Order</Link></li>
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
    </div>
  );
};

export default HomePage;