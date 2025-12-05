'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartModal() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/orders/place');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Shopping Cart
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Items Count */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-600">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-2">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-200"
                  >
                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{item.unit}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="rounded-lg bg-white border border-gray-300 p-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-lg bg-white border border-gray-300 p-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 line-through">
                          SAR{(item.price * item.quantity * 1.1).toFixed(2)}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          SAR{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 space-y-4">
              {/* Shipping */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">SHIPPING</span>
                  <button className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    Standard Delivery - SAR 5.00
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  PROMO CODE
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter your code"
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors">
                    APPLY
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">TOTAL COST</span>
                  <span className="text-2xl font-black text-gray-900">
                    SAR{(totalPrice + 5).toFixed(2)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  CHECKOUT
                </button>
              </div>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 py-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
