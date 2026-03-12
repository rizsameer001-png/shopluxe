'use client';

import { useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const statusSteps = [
  { key: 'pending',    icon: Clock,        label: 'Order Placed',  desc: 'Your order has been received' },
  { key: 'confirmed',  icon: CheckCircle,  label: 'Confirmed',     desc: 'Order confirmed by store' },
  { key: 'processing', icon: Package,      label: 'Processing',    desc: 'Being prepared for shipment' },
  { key: 'shipped',    icon: Truck,        label: 'Shipped',       desc: 'On its way to you' },
  { key: 'delivered',  icon: CheckCircle,  label: 'Delivered',     desc: 'Successfully delivered' },
];

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      // Try searching by order number from user's orders
      const { data } = await ordersAPI.getMyOrders({ limit: 50 });
      const found = (data.data || []).find((o: any) => o.orderNumber?.toLowerCase() === query.trim().toLowerCase() || o._id === query.trim());
      if (found) {
        setOrder(found);
      } else {
        setError('No order found with that number. Please check and try again.');
      }
    } catch {
      setError('Please sign in to track your orders.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? statusSteps.findIndex(s => s.key === order.orderStatus) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
        <p className="text-gray-500 mt-2">Enter your order number to see real-time updates</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. ORD-2501-12345"
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <button type="submit" disabled={loading || !query.trim()}
          className="bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Track'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>
      )}

      {order && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Number</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">#{order.orderNumber}</p>
              <p className="text-sm text-gray-500 mt-1">Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">${order.totalPrice?.toFixed(2)}</p>
            </div>
          </div>

          {order.orderStatus === 'cancelled' ? (
            <div className="p-6 flex items-center gap-3 bg-red-50">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Order Cancelled</p>
                <p className="text-sm text-red-600">This order has been cancelled.</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
                <div className="space-y-6">
                  {statusSteps.map((step, i) => {
                    const done = i <= stepIndex;
                    const active = i === stepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                          <p className={`text-xs mt-0.5 ${done ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                          {active && <span className="inline-block text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full mt-1">Current</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {order.trackingNumber && (
                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-700 font-medium">Tracking Number: <span className="font-bold">{order.trackingNumber}</span></p>
                  {order.estimatedDelivery && <p className="text-xs text-blue-600 mt-1">Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>}
                </div>
              )}
            </div>
          )}

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Link href={`/orders/${order._id}`} className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-1">
              View full order details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-10 bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Want to see all your orders?</p>
        <Link href="/orders" className="text-sm font-semibold text-gray-900 hover:underline flex items-center gap-1 justify-center">
          My Orders <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
