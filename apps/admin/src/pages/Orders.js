import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../lib/api';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
};
const paymentColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
};
const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
export default function OrdersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', search, statusFilter, page],
        queryFn: () => adminAPI.getOrders({ search, status: statusFilter, page, limit: 15 }),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminAPI.updateOrderStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success('Order updated');
        },
        onError: () => toast.error('Failed to update order'),
    });
    const orders = data?.data?.data || [];
    const pagination = data?.data?.pagination || {};
    const handleStatusChange = (orderId, orderStatus) => {
        updateMutation.mutate({ id: orderId, data: { orderStatus } });
    };
    return (_jsxs("div", { className: "p-6 lg:p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Orders" }), _jsxs("p", { className: "text-gray-500 text-sm mt-1", children: [pagination.total || 0, " total orders"] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-6", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by order number...", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, className: "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" })] }), _jsxs("select", { value: statusFilter, onChange: e => { setStatusFilter(e.target.value); setPage(1); }, className: "border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white", children: [_jsx("option", { value: "", children: "All Statuses" }), orderStatuses.map(s => _jsx("option", { value: s, className: "capitalize", children: s }, s))] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Order" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Customer" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Items" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Total" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Payment" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Status" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Date" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-50", children: isLoading ? ([...Array(8)].map((_, i) => (_jsx("tr", { className: "animate-pulse", children: [...Array(7)].map((_, j) => _jsx("td", { className: "px-5 py-4", children: _jsx("div", { className: "h-4 bg-gray-200 rounded w-24" }) }, j)) }, i)))) : orders.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-16 text-gray-400", children: "No orders found" }) })) : (orders.map((order) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-5 py-4", children: _jsxs("span", { className: "text-sm font-semibold text-gray-900", children: ["#", order.orderNumber] }) }), _jsx("td", { className: "px-5 py-4", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: order.user?.name }), _jsx("p", { className: "text-xs text-gray-500", children: order.user?.email })] }) }), _jsx("td", { className: "px-5 py-4", children: _jsxs("span", { className: "text-sm text-gray-600", children: [order.items?.length, " items"] }) }), _jsx("td", { className: "px-5 py-4", children: _jsxs("span", { className: "text-sm font-semibold text-gray-900", children: ["$", order.totalPrice?.toFixed(2)] }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: `text-xs px-2.5 py-1 rounded-full font-medium ${paymentColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`, children: order.paymentStatus }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("select", { value: order.orderStatus, onChange: e => handleStatusChange(order._id, e.target.value), className: `text-xs px-2.5 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`, children: orderStatuses.map(s => (_jsx("option", { value: s, className: "capitalize bg-white text-gray-900", children: s }, s))) }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: "text-xs text-gray-500", children: new Date(order.createdAt).toLocaleDateString() }) })] }, order._id)))) })] }) }), pagination.pages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-t border-gray-100", children: [_jsxs("p", { className: "text-sm text-gray-500", children: ["Page ", page, " of ", pagination.pages] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setPage(p => p - 1), disabled: page === 1, className: "px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors", children: "Previous" }), _jsx("button", { onClick: () => setPage(p => p + 1), disabled: page >= pagination.pages, className: "px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors", children: "Next" })] })] }))] })] }));
}
