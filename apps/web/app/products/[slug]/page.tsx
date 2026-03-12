'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Star, Minus, Plus, ArrowLeft, Share2, Shield, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { productsAPI, cartAPI, reviewsAPI, authAPI, imgUrl } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/store';
import { ProductCard } from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsAPI.getOne(slug).then(({ data }) => {
      setProduct(data.data);
      setRelated(data.related || []);
    }).catch(() => toast.error('Product not found')).finally(() => setLoading(false));

    reviewsAPI.getForProduct(slug, { limit: 6 }).then(({ data }) => setReviews(data.data || [])).catch(() => {});
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return; }
    setAddingToCart(true);
    try {
      const { data } = await cartAPI.add(product._id, quantity);
      setCart(data.data);
      toast.success('Added to cart!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add');
    } finally { setAddingToCart(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return; }
    try {
      await authAPI.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { toast.error('Failed'); }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-5">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <Link href="/products" className="text-gray-600 hover:text-gray-900 underline">Browse all products</Link>
      </div>
    );
  }

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/600', alt: product.name }];

  const resolvedImages = images.map((img: any) => ({ ...img, url: imgUrl(img.url) }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900">Products</Link>
        {product.category && <><span>/</span><Link href={`/products?category=${product.category._id}`} className="hover:text-gray-900">{product.category.name}</Link></>}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          {/*<div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">*/}
          <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img src={resolvedImages[activeImage]?.url} alt={resolvedImages[activeImage]?.alt || product.name} className="w-full h-full object-cover" />
          </div>
          {resolvedImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {resolvedImages.map((img: any, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}>
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{product.brand}</p>}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating?.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.numReviews.toLocaleString()} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xl text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span className="bg-red-100 text-red-700 text-sm font-bold px-2.5 py-1 rounded-full">Save {discount}%</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock'}
            </span>
          </div>

          {/* Qty + Actions */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-bold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={addingToCart}
                className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {addingToCart ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                Add to Cart
              </button>
              <button onClick={handleWishlist}
                className={`p-3.5 border rounded-xl transition-all ${isWishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:border-gray-400 text-gray-500'}`}>
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            {[{ icon: Truck, label: 'Free Shipping', sub: 'Over $100' }, { icon: Shield, label: 'Secure Payment', sub: 'SSL Encrypted' }, { icon: RefreshCw, label: 'Easy Returns', sub: '30-day policy' }].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                <Icon className="w-5 h-5 mx-auto mb-1.5 text-gray-600" />
                <p className="text-xs font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {product.tags.map((tag: string) => (
              <Link key={tag} href={`/products?tags=${tag}`}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review: any) => (
              <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{review.user?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.user?.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.title && <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>}
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
