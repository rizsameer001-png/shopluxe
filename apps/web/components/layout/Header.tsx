'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Heart, User, Menu, X, Package, RefreshCw, MapPin, ChevronRight, Truck } from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore } from '@/store';
import { useRouter } from 'next/navigation';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { setCartOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return;
    const close = () => setAccountOpen(false);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [accountOpen]);

  const totalItems = getTotalItems();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/categories', label: 'Categories' },
    { href: '/products?isFeatured=true', label: 'Featured' },
    { href: '/products?sort=popular', label: 'Best Sellers' },
  ];

  const accountLinks = [
    { href: '/profile',  label: 'My Account',   icon: User },
    { href: '/orders',   label: 'My Orders',     icon: Package },
    { href: '/wishlist', label: 'Wishlist',       icon: Heart },
    { href: '/track',    label: 'Track Order',    icon: Truck },
    { href: '/returns',  label: 'Returns',        icon: RefreshCw },
  ];

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'}`}>
      {/* Announcement Bar */}
      <div className="bg-gray-900 text-white text-xs text-center py-2 px-4">
        🎉 Free shipping on orders over $100 — Use code{' '}
        <span className="font-bold text-yellow-400">WELCOME10</span> for 10% off your first order
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShopLux</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex-1 max-w-xs focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Account dropdown */}
            {isAuthenticated ? (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-2xl border border-gray-100 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Nav links */}
                    <div className="py-1">
                      {accountLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Icon className="w-4 h-4 text-gray-400" />
                          {label}
                          <ChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
                        </Link>
                      ))}
                    </div>

                    {/* Admin link */}
                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                      <div className="border-t border-gray-100 py-1">
                        <Link href="http://localhost:3001" target="_blank"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          Admin Dashboard ↗
                        </Link>
                      </div>
                    )}

                    {/* Sign out */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => { logout(); setAccountOpen(false); router.push('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-full">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-1">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 mb-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/products?keyword=${encodeURIComponent(searchQuery)}`); setMobileMenuOpen(false); }}}
                className="bg-transparent text-sm outline-none w-full" />
            </div>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  {accountLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-400" />{label}
                    </Link>
                  ))}
                </div>
                <button onClick={() => { logout(); setMobileMenuOpen(false); router.push('/'); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  <X className="w-4 h-4" /> Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
