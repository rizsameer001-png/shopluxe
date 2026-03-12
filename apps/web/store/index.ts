import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  addresses: any[];
  wishlist?: string[];
  isEmailVerified: boolean;
}

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: { url: string; alt?: string }[];
    slug: string;
    stock: number;
  };
  quantity: number;
  price: number;
  variant?: { name: string; value: string };
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  totalPrice?: number;
  totalItems?: number;
}

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, token, refreshToken, isAuthenticated: true });
      },
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Cart Store
interface CartState {
  cart: Cart;
  isLoading: boolean;
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: { items: [] },
  isLoading: false,
  
  setCart: (cart) => set({ cart }),
  
  addItem: (item) => set((state) => {
    const existing = state.cart.items.find(i => i.product._id === item.product._id);
    if (existing) {
      return {
        cart: {
          ...state.cart,
          items: state.cart.items.map(i =>
            i.product._id === item.product._id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        },
      };
    }
    return { cart: { ...state.cart, items: [...state.cart.items, item] } };
  }),
  
  removeItem: (itemId) => set((state) => ({
    cart: { ...state.cart, items: state.cart.items.filter(i => i._id !== itemId) },
  })),
  
  updateQuantity: (itemId, quantity) => set((state) => ({
    cart: {
      ...state.cart,
      items: quantity <= 0
        ? state.cart.items.filter(i => i._id !== itemId)
        : state.cart.items.map(i => i._id === itemId ? { ...i, quantity } : i),
    },
  })),
  
  clearCart: () => set({ cart: { items: [] } }),
  
  getTotalItems: () => get().cart.items.reduce((sum, item) => sum + item.quantity, 0),
  
  getTotalPrice: () => get().cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

// UI Store
interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
