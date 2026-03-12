import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'ShopLux — Premium E-commerce', template: '%s | ShopLux' },
  description: 'Discover premium products at ShopLux.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          <Header />
          <CartDrawer />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000, style: { borderRadius: '8px', background: '#1a1a2e', color: '#fff' } }}
          />
        </Providers>
      </body>
    </html>
  );
}
