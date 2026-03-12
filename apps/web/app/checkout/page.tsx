'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/store';
import { cartAPI, ordersAPI, paymentsAPI, authAPI, imgUrl } from '@/lib/api';
import Link from 'next/link';
import {
  MapPin, CreditCard, Truck, ChevronRight, ChevronLeft,
  ShoppingBag, Check, Lock, Plus, Loader2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

const EMPTY_ADDRESS: Address = {
  fullName: '', phone: '', street: '', city: '', state: '', country: '', zipCode: '',
};

const STEPS = ['Shipping', 'Payment', 'Review'];

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < current ? 'bg-green-500 text-white' :
              i === current ? 'bg-gray-900 text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${i === current ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-5 mx-1 transition-all ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { cart, setCart, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  // Shipping
  const [usesSavedAddress, setUsesSavedAddress] = useState(false);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState<number | null>(null);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<Partial<Address>>({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [cardName, setCardName] = useState('');
  // Stripe elements placeholders (we use a hosted-like mock for demo)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Completed order
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // ── Load cart + prefill address ──
  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=/checkout'); return; }
    cartAPI.get()
      .then(({ data }) => {
        setCart(data.data);
        if (data.data.items.length === 0) { router.push('/cart'); return; }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Prefill default address
    if (user?.addresses?.length) {
      const def = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
      setAddress({
        fullName: def.fullName || user.name || '',
        phone: def.phone || user.phone || '',
        street: def.street || '',
        city: def.city || '',
        state: def.state || '',
        country: def.country || '',
        zipCode: def.zipCode || '',
      });
      setUsesSavedAddress(true);
      setSelectedSavedIdx(user.addresses.indexOf(def));
    } else {
      setAddress(p => ({ ...p, fullName: user?.name || '', phone: user?.phone || '' }));
    }
  }, [isAuthenticated]);

  // ── Pricing ──
  const subtotal = getTotalPrice();
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  // ── Address validation ──
  const validateAddress = () => {
    const errors: Partial<Address> = {};
    const req: (keyof Address)[] = ['fullName', 'phone', 'street', 'city', 'state', 'country', 'zipCode'];
    req.forEach(k => { if (!address[k].trim()) errors[k] = 'Required'; });
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavedAddressSelect = (idx: number) => {
    const addr = user.addresses[idx];
    setSelectedSavedIdx(idx);
    setAddress({
      fullName: addr.fullName, phone: addr.phone, street: addr.street,
      city: addr.city, state: addr.state, country: addr.country, zipCode: addr.zipCode,
    });
  };

  // ── Navigation ──
  const goNext = () => {
    if (step === 0 && !validateAddress()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      // 1. Create the order
      const orderPayload = {
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
        items: cart.items.map((item: any) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || '',
          variant: item.variant,
        })),
      };
      const { data: orderData } = await ordersAPI.create(orderPayload);
      const order = orderData.data;

      // 2. Handle payment
      if (paymentMethod === 'stripe') {
        // Create payment intent
        await paymentsAPI.createIntent(Math.round(total * 100), order._id);
        // In a real app you'd use Stripe.js confirmCardPayment here.
        // For demo we just mark as success.
        toast.success('Payment processed successfully!');
      } else {
        toast.success('Order placed! Pay on delivery.');
      }

      // 3. Clear cart
      await cartAPI.clear();
      clearCart();

      setPlacedOrder(order);
      setStep(3); // success screen
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── Success screen ───
  if (step === 3 && placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-1">Thank you for your purchase.</p>
        <p className="text-sm text-gray-400 mb-6">
          Order <span className="font-semibold text-gray-700">#{placedOrder.orderNumber}</span> has been confirmed.
          {user?.email && ` A confirmation email will be sent to ${user.email}.`}
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Order Number</span><span className="font-semibold">#{placedOrder.orderNumber}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-semibold capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card (Stripe)'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-bold text-gray-900">${total.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Estimated Delivery</span><span className="font-semibold">5–7 business days</span></div>
        </div>

        <div className="flex gap-3">
          <Link href={`/orders/${placedOrder._id}`}
            className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors text-center">
            Track Order
          </Link>
          <Link href="/products"
            className="flex-1 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Layout ───
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <div className="flex items-center gap-1 ml-auto text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" /> Secure checkout
        </div>
      </div>

      <StepBar current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left panel ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* STEP 0 — Shipping */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" /> Shipping Address
              </h2>

              {/* Saved addresses */}
              {user?.addresses?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Saved addresses</p>
                  <div className="space-y-2">
                    {user.addresses.map((addr: any, idx: number) => (
                      <label key={idx} className={`flex items-start gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${selectedSavedIdx === idx ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="savedAddr" checked={selectedSavedIdx === idx}
                          onChange={() => handleSavedAddressSelect(idx)} className="mt-0.5 accent-gray-900" />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{addr.fullName}
                            {addr.isDefault && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Default</span>}
                          </p>
                          <p className="text-gray-500 mt-0.5">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-gray-500">{addr.country} · {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                    <label className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${selectedSavedIdx === null ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="savedAddr" checked={selectedSavedIdx === null}
                        onChange={() => { setSelectedSavedIdx(null); setAddress(EMPTY_ADDRESS); }} className="accent-gray-900" />
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Use a new address</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Address form — show when no saved address selected OR new address chosen */}
              {(selectedSavedIdx === null || !user?.addresses?.length) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', span: false },
                    { key: 'phone', label: 'Phone Number', placeholder: '+1 234 567 890', span: false },
                    { key: 'street', label: 'Street Address', placeholder: '123 Main Street, Apt 4B', span: true },
                    { key: 'city', label: 'City', placeholder: 'New York', span: false },
                    { key: 'state', label: 'State / Province', placeholder: 'NY', span: false },
                    { key: 'country', label: 'Country', placeholder: 'United States', span: false },
                    { key: 'zipCode', label: 'ZIP / Postal Code', placeholder: '10001', span: false },
                  ] as { key: keyof Address; label: string; placeholder: string; span: boolean }[]).map(({ key, label, placeholder, span }) => (
                    <div key={key} className={span ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
                      <input
                        value={address[key]}
                        onChange={e => { setAddress(p => ({ ...p, [key]: e.target.value })); setAddressErrors(p => ({ ...p, [key]: '' })); }}
                        placeholder={placeholder}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 transition-all ${addressErrors[key] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {addressErrors[key] && <p className="text-xs text-red-500 mt-1">{addressErrors[key]}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Payment */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" /> Payment Method
              </h2>

              {/* Method selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="pm" value="stripe" checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')} className="accent-gray-900" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">💳 Credit / Debit Card</p>
                    <p className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, Amex</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="pm" value="cod" checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')} className="accent-gray-900" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">💵 Cash on Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pay when you receive</p>
                  </div>
                </label>
              </div>

              {/* Card form */}
              {paymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Demo mode — use test card <strong>4242 4242 4242 4242</strong>, any future expiry, any CVC.</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                    <input value={cardName} onChange={e => setCardName(e.target.value)}
                      placeholder="Name as on card"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        value={cardNumber}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 font-mono tracking-wider pr-16"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">VISA</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">MC</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                      <input
                        value={cardExpiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
                      <input
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Your card details are encrypted and never stored on our servers.</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                  <p className="font-semibold mb-1">Cash on Delivery selected</p>
                  <p className="text-green-700">You'll pay <strong>${total.toFixed(2)}</strong> when your order arrives. Please have exact change ready.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Review */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Items */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-400" /> Order Items ({cart.items.length})
                </h2>
                <div className="space-y-4">
                  {cart.items.map((item: any) => (
                    <div key={item._id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                        <img src={imgUrl(item.product?.images?.[0]?.url)} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product?.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address recap */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Shipping To
                  </h3>
                  <button onClick={() => setStep(0)} className="text-xs text-gray-500 hover:text-gray-900 underline">Edit</button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">{address.fullName}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country} · {address.phone}</p>
                </div>
              </div>

              {/* Payment recap */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" /> Payment
                  </h3>
                  <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-gray-900 underline">Edit</button>
                </div>
                <p className="text-sm text-gray-700">
                  {paymentMethod === 'stripe'
                    ? `💳 Card ending in ${cardNumber.replace(/\s/g, '').slice(-4) || '••••'}`
                    : '💵 Cash on Delivery'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={goNext}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handlePlaceOrder} disabled={placing}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-700 disabled:opacity-60 transition-colors">
                {placing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><Lock className="w-4 h-4" /> Place Order · ${total.toFixed(2)}</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ── Right panel — Order summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Items preview */}
            <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
              {cart.items.map((item: any) => (
                <div key={item._id} className="flex gap-3 items-center">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={imgUrl(item.product?.images?.[0]?.url)} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2 flex-1">{item.product?.name}</p>
                  <p className="text-xs font-bold text-gray-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                  Add <strong>${(100 - subtotal).toFixed(2)}</strong> more for free shipping!
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              {[
                { icon: Lock, text: 'SSL encrypted & secure' },
                { icon: Truck, text: 'Ships within 1–2 business days' },
                { icon: Check, text: '30-day hassle-free returns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
