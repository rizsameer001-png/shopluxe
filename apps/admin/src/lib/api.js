import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
api.interceptors.response.use((response) => response, async (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export const adminAPI = {
    // Auth
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    // Dashboard
    getStats: () => api.get('/dashboard/stats'),
    // Products
    getProducts: (params) => api.get('/products', { params: { ...params, limit: 20 } }),
    getProduct: (id) => api.get(`/products/${id}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    // Categories
    getCategories: () => api.get('/categories'),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
    // Orders
    getOrders: (params) => api.get('/orders', { params }),
    getOrder: (id) => api.get(`/orders/${id}`),
    updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    // Users
    getUsers: (params) => api.get('/users', { params }),
    getUser: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    // Uploads
    upload: (files) => api.post('/uploads', files, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
export default api;
// ── Image URL helper ──────────────────────────────────────────────────────────
// Server may return relative paths like "/uploads/file.jpg".
// Converts them to full URLs pointing at the API server.
export function imgUrl(url) {
    if (!url)
        return 'https://via.placeholder.com/200x200?text=No+Image';
    if (url.startsWith('http'))
        return url;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
