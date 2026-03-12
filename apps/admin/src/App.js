import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAdminAuth } from './store/auth';
import { Sidebar } from './components/layout/Sidebar';
import DashboardPage from './pages/Dashboard';
import ProductsPage from './pages/Products';
import OrdersPage from './pages/Orders';
import { UsersPage, CategoriesPage } from './pages/UsersAndCategories';
import LoginPage from './pages/Login';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
    },
});
function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAdminAuth();
    if (!isAuthenticated)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (user && !['admin', 'superadmin'].includes(user.role)) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-4xl mb-4", children: "\uD83D\uDEAB" }), _jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: "Access Denied" }), _jsx("p", { className: "text-gray-500", children: "Admin privileges required." })] }) }));
    }
    return _jsx(_Fragment, { children: children });
}
function Layout({ children }) {
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-50", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 overflow-auto min-w-0", children: children })] }));
}
function App() {
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/*", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/products", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "/categories", element: _jsx(CategoriesPage, {}) }), _jsx(Route, { path: "/orders", element: _jsx(OrdersPage, {}) }), _jsx(Route, { path: "/users", element: _jsx(UsersPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }) })] }) }), _jsx(Toaster, { position: "top-right", toastOptions: { duration: 3000, style: { borderRadius: '8px', background: '#1a1a2e', color: '#fff' } } })] }));
}
export default App;
