'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useState } from 'react';
import { cartAPI, authAPI, imgUrl } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/store';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  slug: string;
  rating: number;
  numReviews: number;
  stock: number;
  brand?: string;
  isFeatured?: boolean;
  discountPercentage?: number;
  category?: { name: string; slug: string };
}

export function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const imageUrl = imgUrl(product.images?.[0]?.url);
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    if (product.stock === 0) {
      toast.error('Out of stock');
      return;
    }
    setAddingToCart(true);
    try {
      const { data } = await cartAPI.add(product._id, 1);
      setCart(data.data);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to save items');
      return;
    }
    try {
      await authAPI.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">-{discount}%</span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Sold Out</span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
              }`}>
              <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={e => e.stopPropagation()}
              className="w-9 h-9 bg-white text-gray-600 hover:text-gray-900 rounded-full flex items-center justify-center shadow-md transition-all">
              <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* Add to cart */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {addingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.numReviews.toLocaleString()})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
