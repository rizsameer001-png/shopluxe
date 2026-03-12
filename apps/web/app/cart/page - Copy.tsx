'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, useCartStore } from '@/store';
import { cartAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart, getTotalPrice } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    cartAPI.get().then(({ data }) => setCart(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleUpdate = async (itemId: string, qty: number) => {
    setUpdating(itemId);
    try {
      const { data } = await cartAPI.updateItem(itemId, qty);
      setCart(data.data);
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const { data } = await cartAPI.removeItem(itemId);
      setCart(data.data);
      toast.success('Item removed');
    } catch { toast.error('Failed to remove'); }
    finally { setUpdating(null); }
  };

  const handleClear = async () => {
    if (!confirm('Clear all items from cart?')) return;
    try {
      await cartAPI.clear();
      setCart({ items: [] });
      toast.success('Cart cleared');
    } catch { toast.error('Failed to clear cart'); }
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart
          {cart.items.length > 0 && <span className="ml-2 text-base font-normal text-gray-400">({cart.items.length} items)</span>}
        </h1>
        {cart.items.length > 0 && (
          <button onClick={handleClear} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started</p>
          <Link href="/products" className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item: any) => (
              <div key={item._id} className={`bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 transition-opacity ${updating === item._id ? 'opacity-50' : ''}`}>
                <Link href={`/products/${item.product?.slug}`} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'} alt={item.product?.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/products/${item.product?.slug}`} className="text-sm font-semibold text-gray-900 hover:text-gray-600 line-clamp-2 transition-colors">{item.product?.name}</Link>
                      {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">${item.price.toFixed(2)} each</p>
                    </div>
                    <button onClick={() => handleRemove(item._id)} disabled={updating === item._id}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => handleUpdate(item._id, item.quantity - 1)} disabled={updating === item._id || item.quantity <= 1}
                        className="p-2 hover:bg-gray-50 disabled:opacity-30 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-sm font-bold w-10 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdate(item._id, item.quantity + 1)} disabled={updating === item._id || item.quantity >= item.product?.stock}
                        className="p-2 hover:bg-gray-50 disabled:opacity-30 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-base font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? subtotal > 0 ? 'FREE' : '—' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                {subtotal > 0 && subtotal < 100 && (
                  <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-xl">
                    Add <strong>${(100 - subtotal).toFixed(2)}</strong> more for free shipping!
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout"
                className="mt-5 w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products" className="mt-3 w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
