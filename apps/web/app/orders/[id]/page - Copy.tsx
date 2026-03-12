'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, MapPin, CreditCard } from 'lucide-react';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending:    { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock, label: 'Pending' },
  confirmed:  { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: CheckCircle, label: 'Confirmed' },
  processing: { color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Package, label: 'Processing' },
  shipped:    { color: 'text-purple-700', bg: 'bg-purple-100', icon: Truck, label: 'Shipped' },
  delivered:  { color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle, label: 'Delivered' },
  cancelled:  { color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle, label: 'Cancelled' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    ordersAPI.getOne(params.id as string)
      .then(({ data }) => setOrder(data.data))
      .catch(() => router.push('/orders'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, params.id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}</div>;
  if (!order) return null;

  const cfg = statusConfig[order.orderStatus] || statusConfig.pending;
  const StatusIcon = cfg.icon;
  const stepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-1">Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="w-4 h-4" /> {cfg.label}
          </span>
        </div>

        {/* Progress bar (not cancelled) */}
        {order.orderStatus !== 'cancelled' && stepIndex >= 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= stepIndex ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs mt-1 capitalize hidden sm:block ${i <= stepIndex ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{step}</p>
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute h-0.5 flex-1 ${i < stepIndex ? 'bg-gray-900' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="relative h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-gray-900 rounded-full transition-all" style={{ width: `${(stepIndex / (statusSteps.length - 1)) * 100}%` }} />
            </div>
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-4 bg-blue-50 rounded-xl p-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">Tracking: <span className="font-semibold">{order.trackingNumber}</span></p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
        <div className="divide-y divide-gray-50 space-y-4">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className={`flex gap-4 ${i > 0 ? 'pt-4' : ''}`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                {item.variant && <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>}
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Shipping */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Address</h2>
          {order.shippingAddress && (
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-gray-400">{order.shippingAddress.phone}</p>
            </div>
          )}
        </div>

        {/* Payment summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.paymentStatus}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 capitalize">{order.paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
