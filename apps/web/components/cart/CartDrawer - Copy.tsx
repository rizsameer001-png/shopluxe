'use client';

import { useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, useUIStore, useAuthStore } from '@/store';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const { cart, setCart, getTotalPrice, getTotalItems } = useCartStore();
  const { cartOpen, setCartOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && cartOpen) {
      cartAPI.get().then(({ data }) => setCart(data.data)).catch(() => {});
    }
  }, [cartOpen, isAuthenticated]);

  const handleUpdateQty = async (itemId: string, qty: number) => {
    try {
      const { data } = await cartAPI.updateItem(itemId, qty);
      setCart(data.data);
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const { data } = await cartAPI.removeItem(itemId);
      setCart(data.data);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
            {totalItems > 0 && (
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <div>
                <p className="text-gray-900 font-semibold mb-1">Sign in to view your cart</p>
                <p className="text-sm text-gray-500">Your items are saved when you're logged in</p>
              </div>
              <Link
                href="/login"
                onClick={() => setCartOpen(false)}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <div>
                <p className="text-gray-900 font-semibold mb-1">Your cart is empty</p>
                <p className="text-sm text-gray-500">Add items to get started</p>
              </div>
              <Link
                href="/products"
                onClick={() => setCartOpen(false)}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item._id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-gray-100">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product?.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 99)}
                          className="p-1.5 hover:bg-gray-50 rounded-r-lg transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && cart.items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">{totalPrice > 100 ? 'FREE' : '$10.00'}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${(totalPrice + (totalPrice > 100 ? 0 : 10)).toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cart"
              onClick={() => setCartOpen(false)}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
