import Link from 'next/link';
import { categoriesAPI } from '@/lib/api';
import { ArrowRight, Grid3X3 } from 'lucide-react';

const fallbackImages: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
  clothing: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
  'home-garden': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
  'sports-outdoors': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80',
  books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80',
  'beauty-health': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
  'toys-games': 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=500&q=80',
  'food-grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
  default: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80',
};

async function getCategories() {
  try {
    const { data } = await categoriesAPI.getAll();
    return data.data || [];
  } catch { return []; }
}

export const metadata = { title: 'Categories' };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Categories</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Grid3X3 className="w-7 h-7" /> All Categories
        </h1>
        <p className="text-gray-500 mt-2">{categories.length} categories — find exactly what you need</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat: any) => {
            const img = cat.image || fallbackImages[cat.slug] || fallbackImages.default;
            return (
              <Link key={cat._id} href={`/products?category=${cat._id}`}
                className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3] shadow-sm hover:shadow-lg transition-all duration-300">
                <img src={img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-2xl mb-1">{cat.icon || '🛍️'}</div>
                  <h2 className="text-white font-bold text-base leading-tight">{cat.name}</h2>
                  {cat.description && <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{cat.description}</p>}
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Shop all */}
      <div className="mt-12 text-center">
        <Link href="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-700 transition-colors">
          View All Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
