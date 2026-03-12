import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
const COLORS = ['#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0'];
const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export default function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => adminAPI.getStats(),
        refetchInterval: 60000,
    });
    const stats = data?.data?.data;
    if (isLoading) {
        return (_jsx("div", { className: "p-8", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [...Array(4)].map((_, i) => (_jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded mb-3 w-24" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-32" })] }, i))) }) }));
    }
    const overview = stats?.overview || {};
    const revenueData = (stats?.revenueByMonth || []).map((m) => ({
        month: monthNames[m._id.month - 1],
        revenue: Math.round(m.revenue),
        orders: m.orders,
    }));
    const orderStatusData = (stats?.ordersByStatus || []).map((s) => ({
        name: s._id,
        value: s.count,
    }));
    const metricCards = [
        {
            title: 'Total Revenue',
            value: `$${(overview.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subValue: `$${(overview.monthRevenue || 0).toLocaleString()} this month`,
            growth: overview.revenueGrowth,
            icon: DollarSign,
            color: 'bg-green-50 text-green-600',
        },
        {
            title: 'Total Orders',
            value: overview.totalOrders?.toLocaleString() || '0',
            subValue: `${overview.monthOrders || 0} this month`,
            icon: ShoppingCart,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Total Users',
            value: overview.totalUsers?.toLocaleString() || '0',
            subValue: `+${overview.monthUsers || 0} this month`,
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            title: 'Products',
            value: overview.totalProducts?.toLocaleString() || '0',
            subValue: `${overview.lowStockProducts || 0} low in stock`,
            icon: Package,
            color: overview.lowStockProducts > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600',
        },
    ];
    return (_jsxs("div", { className: "p-6 lg:p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Welcome back! Here's what's happening today." })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8", children: metricCards.map(card => (_jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: card.title }), _jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`, children: _jsx(card.icon, { className: "w-5 h-5" }) })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mb-1", children: card.value }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-gray-500", children: card.subValue }), card.growth !== undefined && (_jsxs("span", { className: `flex items-center gap-1 text-xs font-medium ${card.growth >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [card.growth >= 0 ? _jsx(TrendingUp, { className: "w-3 h-3" }) : _jsx(TrendingDown, { className: "w-3 h-3" }), Math.abs(card.growth), "%"] }))] })] }, card.title))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900 mb-6", children: "Revenue Overview" }), revenueData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(AreaChart, { data: revenueData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "revenueGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#0f172a", stopOpacity: 0.15 }), _jsx("stop", { offset: "95%", stopColor: "#0f172a", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f1f5f9" }), _jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 12 }, axisLine: false, tickLine: false, tickFormatter: (v) => `$${v.toLocaleString()}` }), _jsx(Tooltip, { formatter: (v) => [`$${v.toLocaleString()}`, 'Revenue'], contentStyle: { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } }), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#0f172a", strokeWidth: 2, fill: "url(#revenueGrad)" })] }) })) : (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-400", children: "No revenue data yet" }))] }), _jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-100", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900 mb-6", children: "Orders by Status" }), orderStatusData.length > 0 ? (_jsxs(_Fragment, { children: [_jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: orderStatusData, cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 70, dataKey: "value", children: orderStatusData.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, index))) }), _jsx(Tooltip, {})] }) }), _jsx("div", { className: "space-y-2 mt-4", children: orderStatusData.slice(0, 5).map((item, i) => (_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full", style: { background: COLORS[i % COLORS.length] } }), _jsx("span", { className: "capitalize text-gray-600", children: item.name })] }), _jsx("span", { className: "font-semibold text-gray-900", children: item.value })] }, item.name))) })] })) : (_jsx("div", { className: "flex items-center justify-center h-48 text-gray-400", children: "No orders yet" }))] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Recent Orders" }), _jsx(Link, { to: "/orders", className: "text-xs text-gray-500 hover:text-gray-900 font-medium", children: "View all \u2192" })] }), _jsx("div", { className: "space-y-3", children: (stats?.recentOrders || []).length === 0 ? (_jsx("p", { className: "text-sm text-gray-400 text-center py-8", children: "No orders yet" })) : ((stats?.recentOrders || []).map((order) => (_jsxs(Link, { to: `/orders/${order._id}`, className: "flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-gray-900 group-hover:text-gray-600", children: ["#", order.orderNumber] }), _jsx("p", { className: "text-xs text-gray-500", children: order.user?.name })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-semibold text-gray-900", children: ["$", order.totalPrice?.toFixed(2)] }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`, children: order.orderStatus })] })] }, order._id)))) })] }), _jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Top Products" }), _jsx(Link, { to: "/products", className: "text-xs text-gray-500 hover:text-gray-900 font-medium", children: "View all \u2192" })] }), _jsx("div", { className: "space-y-3", children: (stats?.topProducts || []).length === 0 ? (_jsx("p", { className: "text-sm text-gray-400 text-center py-8", children: "No products yet" })) : ((stats?.topProducts || []).map((product, i) => (_jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors", children: [_jsx("span", { className: "w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500", children: i + 1 }), _jsx("img", { src: product.images?.[0]?.url || 'https://via.placeholder.com/40', alt: product.name, className: "w-10 h-10 rounded-lg object-cover" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: product.name }), _jsxs("p", { className: "text-xs text-gray-500", children: ["$", product.price, " \u00B7 ", product.salesCount, " sold"] })] })] }, product._id)))) })] })] })] }));
}
