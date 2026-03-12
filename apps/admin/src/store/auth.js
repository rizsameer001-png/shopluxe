import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAdminAuth = create()(persist((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    setAuth: (user, token) => {
        localStorage.setItem('admin_token', token);
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}), {
    name: 'admin-auth',
    partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
}));
