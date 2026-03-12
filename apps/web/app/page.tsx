import Link from 'next/link';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 mb-6">
              ✨ New Collection 2025
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Premium Style
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
              Curated collections of premium products. From cutting-edge electronics to timeless fashion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products?isFeatured=true" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all">
                Featured Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', description: 'On orders over $100' },
              { icon: RefreshCw, title: 'Easy Returns', description: '30-day return policy' },
              { icon: Shield, title: 'Secure Payment', description: '256-bit SSL encryption' },
              { icon: Headphones, title: '24/7 Support', description: 'Dedicated customer service' },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-bold mb-3">Get 20% Off Your First Order</h2>
            <p className="text-gray-400">Use code <span className="text-white font-bold">WELCOME20</span> at checkout</p>
          </div>
          <Link href="/register" className="flex-shrink-0 bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
