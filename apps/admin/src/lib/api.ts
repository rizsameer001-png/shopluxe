import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  
  // Dashboard
  getStats: () => api.get('/dashboard/stats'),
  
  // Products
  getProducts: (params?: any) => api.get('/products', { params: { ...params, limit: 20 } }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
  
  // Orders
  getOrders: (params?: any) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  
  // Users
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  
  // Uploads
  upload: (files: FormData) => api.post('/uploads', files, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;


// ── Image URL helper ──────────────────────────────────────────────────────────
// Server may return relative paths like "/uploads/file.jpg".
// Converts them to full URLs pointing at the API server.
export function imgUrl(url?: string): string {
  if (!url) return 'https://via.placeholder.com/200x200?text=No+Image';
  if (url.startsWith('http')) return url;
  const base = (import.meta.env.VITE_API_URL as string || 'http://localhost:5000/api').replace('/api', '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
