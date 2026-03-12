import Link from 'next/link';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>ShopLux</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Your premier destination for quality products. Curated selections, competitive prices, exceptional service.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-3 text-sm">
              {[['New Arrivals', '/products?sort=-createdAt'], ['Best Sellers', '/products?sort=popular'], ['Featured', '/products?isFeatured=true'], ['Sale', '/products?hasDiscount=true'], ['All Products', '/products']].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              {[['My Account', '/profile'], ['Orders', '/orders'], ['Returns', '/returns'], ['Track Order', '/track'], ['FAQ', '/faq'], ['Contact Us', '/contact']].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>123 Commerce St, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <a href="mailto:support@shoplux.com" className="hover:text-white transition-colors">support@shoplux.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500" />
                <button className="bg-white text-gray-900 px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-gray-100 transition-colors">Join</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2025 ShopLux. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-gray-300">Cookies</Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Secure payments:</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">VISA</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">MC</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">AMEX</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
