'use client';

import { useState, useEffect } from 'react';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Package, ChevronDown, CheckCircle, Mail, ArrowRight } from 'lucide-react';

const returnReasons = [
  'Item arrived damaged',
  'Wrong item received',
  'Item not as described',
  'Size/fit issue',
  'Changed my mind',
  'Found a better price',
  'Quality not as expected',
  'Other',
];

export default function ReturnsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    ordersAPI.getMyOrders({ limit: 50 })
      .then(({ data }) => {
        // Only delivered orders can be returned
        const eligible = (data.data || []).filter((o: any) => o.orderStatus === 'delivered');
        setOrders(eligible);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const orderObj = orders.find(o => o._id === selectedOrder);

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || selectedItems.length === 0 || !reason) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Return Request Submitted!</h1>
        <p className="text-gray-500 mb-2">We've received your return request. You'll get a confirmation email within 24 hours with return instructions.</p>
        <p className="text-sm text-gray-400 mb-8">Returns are processed within 5–7 business days.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/orders" className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-700 transition-colors">My Orders</Link>
          <Link href="/products" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/" className="hover:text-gray-900">Home</Link><span>/</span>
          <span className="text-gray-900">Returns</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request a Return</h1>
            <p className="text-gray-500 text-sm">Delivered orders are eligible within 30 days</p>
          </div>
        </div>
      </div>

      {/* Policy */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
        <h3 className="font-semibold text-blue-900 mb-2">Return Policy</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ 30-day return window from delivery date</li>
          <li>✓ Items must be unused and in original packaging</li>
          <li>✓ Free returns on defective or wrong items</li>
          <li>✓ Refund processed within 5–7 business days</li>
        </ul>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No eligible orders</h3>
          <p className="text-sm text-gray-500 mb-5">Only delivered orders within 30 days are eligible for returns.</p>
          <Link href="/orders" className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-1 justify-center">
            View My Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Order */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">1. Select Order</h2>
            <div className="space-y-3">
              {orders.map(order => (
                <label key={order._id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedOrder === order._id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="order" value={order._id} checked={selectedOrder === order._id}
                    onChange={() => { setSelectedOrder(order._id); setSelectedItems([]); }} className="accent-gray-900" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · ${order.totalPrice?.toFixed(2)} · {order.items?.length} items</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Select Items */}
          {orderObj && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">2. Select Items to Return</h2>
              <div className="space-y-3">
                {orderObj.items?.map((item: any, i: number) => (
                  <label key={i} className={`flex items-center gap-4 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedItems.includes(item.name) ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="checkbox" checked={selectedItems.includes(item.name)}
                      onChange={() => toggleItem(item.name)} className="accent-gray-900 w-4 h-4" />
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} · ${item.price?.toFixed(2)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          {selectedItems.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">3. Reason for Return</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {returnReasons.map(r => (
                  <label key={r} className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer text-sm transition-all ${reason === r ? 'border-gray-900 bg-gray-50 font-medium' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-gray-900" />
                    {r}
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional details (optional)</label>
                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Tell us more about the issue..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
            </div>
          )}

          {reason && selectedItems.length > 0 && (
            <button type="submit" disabled={submitting}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Submit Return Request
            </button>
          )}
        </form>
      )}
    </div>
  );
}
