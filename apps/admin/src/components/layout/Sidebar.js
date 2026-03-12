import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, LogOut, ShoppingBag, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../../store/auth';
const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/categories', icon: Tag, label: 'Categories' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];
export function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAdminAuth();
    const [collapsed, setCollapsed] = useState(false);
    return (_jsxs("aside", { className: `bg-gray-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen`, children: [_jsxs("div", { className: "p-4 flex items-center gap-3 border-b border-gray-700", children: [_jsx("div", { className: "w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(ShoppingBag, { className: "w-4 h-4 text-gray-900" }) }), !collapsed && _jsx("span", { className: "text-lg font-bold", children: "ShopLux Admin" }), _jsx("button", { onClick: () => setCollapsed(!collapsed), className: `ml-auto text-gray-400 hover:text-white transition-colors ${collapsed ? 'mx-auto' : ''}`, children: collapsed ? _jsx(Menu, { className: "w-4 h-4" }) : _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("nav", { className: "flex-1 p-3 space-y-1", children: navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
                    return (_jsxs(Link, { to: path, className: `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                            ? 'bg-white text-gray-900 font-semibold'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`, children: [_jsx(Icon, { className: "w-5 h-5 flex-shrink-0" }), !collapsed && _jsx("span", { className: "text-sm", children: label })] }, path));
                }) }), _jsxs("div", { className: "p-3 border-t border-gray-700", children: [!collapsed && user && (_jsxs("div", { className: "flex items-center gap-3 px-3 py-2 mb-2", children: [_jsx("div", { className: "w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-xs font-bold", children: user.name?.charAt(0) }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-white truncate", children: user.name }), _jsx("p", { className: "text-xs text-gray-400 capitalize", children: user.role })] })] })), _jsxs("button", { onClick: logout, className: "w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-red-900/50 hover:text-red-300 rounded-xl transition-all", children: [_jsx(LogOut, { className: "w-5 h-5 flex-shrink-0" }), !collapsed && _jsx("span", { className: "text-sm", children: "Sign Out" })] })] })] }));
}
