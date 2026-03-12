'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { authAPI, productsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadWishlist();
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.getMe();
      const wishlistIds: string[] = data.user.wishlist?.map((p: any) => p._id || p) || [];
      if (wishlistIds.length > 0) {
        const { data: pd } = await productsAPI.getAll({ ids: wishlistIds.join(','), limit: 50 });
        // wishlist comes populated from getMe
        setProducts(data.user.wishlist?.filter((p: any) => p._id) || []);
      } else {
        setProducts([]);
      }
    } catch { toast.error('Failed to load wishlist'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" /> Wishlist
          </h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save products you love to find them easily later</p>
          <Link href="/products" className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
