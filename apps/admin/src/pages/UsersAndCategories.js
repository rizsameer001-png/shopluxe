import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../lib/api';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
export function UsersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', search, page],
        queryFn: () => adminAPI.getUsers({ search, page, limit: 20 }),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User updated'); },
        onError: () => toast.error('Failed to update user'),
    });
    const users = data?.data?.data || [];
    const pagination = data?.data?.pagination || {};
    const roleColors = {
        user: 'bg-gray-100 text-gray-700',
        admin: 'bg-blue-100 text-blue-700',
        superadmin: 'bg-purple-100 text-purple-700',
    };
    return (_jsxs("div", { className: "p-6 lg:p-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Users" }), _jsxs("p", { className: "text-gray-500 text-sm mt-1", children: [pagination.total || 0, " registered users"] })] }), _jsxs("div", { className: "relative mb-6", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search users...", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, className: "w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [_jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "User" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Role" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Status" }), _jsx("th", { className: "text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Joined" }), _jsx("th", { className: "text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-50", children: isLoading ? ([...Array(8)].map((_, i) => _jsx("tr", { className: "animate-pulse", children: _jsx("td", { colSpan: 5, className: "px-5 py-4", children: _jsx("div", { className: "h-10 bg-gray-100 rounded" }) }) }, i))) : users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-5 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-sm font-bold text-gray-600", children: user.name?.charAt(0) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: user.name }), _jsx("p", { className: "text-xs text-gray-500", children: user.email })] })] }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: `text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`, children: user.role }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: `text-xs px-2.5 py-1 rounded-full font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`, children: user.isActive ? 'Active' : 'Inactive' }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: "text-xs text-gray-500", children: new Date(user.createdAt).toLocaleDateString() }) }), _jsx("td", { className: "px-5 py-4 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [user.role === 'user' && (_jsx("button", { onClick: () => updateMutation.mutate({ id: user._id, data: { role: 'admin' } }), className: "text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors font-medium", children: "Make Admin" })), _jsx("button", { onClick: () => updateMutation.mutate({ id: user._id, data: { isActive: !user.isActive } }), className: `text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`, children: user.isActive ? 'Deactivate' : 'Activate' })] }) })] }, user._id))) })] }), pagination.pages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-t border-gray-100", children: [_jsxs("p", { className: "text-sm text-gray-500", children: ["Page ", page, " of ", pagination.pages] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setPage(p => p - 1), disabled: page === 1, className: "px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50", children: "Previous" }), _jsx("button", { onClick: () => setPage(p => p + 1), disabled: page >= pagination.pages, className: "px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50", children: "Next" })] })] }))] })] }));
}
// ==================== CATEGORIES PAGE ====================
export function CategoriesPage() {
    const [showModal, setShowModal] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '', image: '' });
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: () => adminAPI.getCategories(),
    });
    const saveMutation = useMutation({
        mutationFn: (data) => editCat ? adminAPI.updateCategory(editCat._id, data) : adminAPI.createCategory(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setShowModal(false); toast.success(editCat ? 'Category updated' : 'Category created'); },
        onError: () => toast.error('Failed to save category'),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => adminAPI.deleteCategory(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category deleted'); },
    });
    const categories = data?.data?.data || [];
    const handleEdit = (cat) => {
        setEditCat(cat);
        setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', image: cat.image || '' });
        setShowModal(true);
    };
    const handleAdd = () => {
        setEditCat(null);
        setForm({ name: '', description: '', icon: '', image: '' });
        setShowModal(true);
    };
    return (_jsxs("div", { className: "p-6 lg:p-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Categories" }), _jsxs("p", { className: "text-gray-500 text-sm mt-1", children: [categories.length, " categories"] })] }), _jsx("button", { onClick: handleAdd, className: "flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors", children: "+ Add Category" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5", children: isLoading ? [...Array(8)].map((_, i) => (_jsxs("div", { className: "bg-white rounded-2xl p-5 border border-gray-100 animate-pulse", children: [_jsx("div", { className: "h-6 bg-gray-200 rounded mb-3" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" })] }, i))) : categories.map((cat) => (_jsxs("div", { className: "bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsx("div", { className: "text-3xl", children: cat.icon || '📦' }), _jsxs("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => handleEdit(cat), className: "p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs", children: "Edit" }), _jsx("button", { onClick: () => { if (confirm(`Delete "${cat.name}"?`))
                                                deleteMutation.mutate(cat._id); }, className: "p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs", children: "Del" })] })] }), _jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-1", children: cat.name }), _jsx("p", { className: "text-xs text-gray-500 line-clamp-2", children: cat.description || 'No description' })] }, cat._id))) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl w-full max-w-md shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsxs("h2", { className: "text-xl font-bold", children: [editCat ? 'Edit' : 'Add', " Category"] }), _jsx("button", { onClick: () => setShowModal(false), className: "p-2 hover:bg-gray-100 rounded-xl", children: "\u2715" })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Name *" }), _jsx("input", { type: "text", value: form.name, onChange: e => setForm(p => ({ ...p, name: e.target.value })), className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Description" }), _jsx("input", { type: "text", value: form.description, onChange: e => setForm(p => ({ ...p, description: e.target.value })), className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Icon (emoji)" }), _jsx("input", { type: "text", value: form.icon, onChange: e => setForm(p => ({ ...p, icon: e.target.value })), placeholder: "\uD83D\uDECD\uFE0F", className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Image URL" }), _jsx("input", { type: "url", value: form.image, onChange: e => setForm(p => ({ ...p, image: e.target.value })), className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" })] })] })] }), _jsxs("div", { className: "flex gap-3 p-6 border-t", children: [_jsx("button", { onClick: () => setShowModal(false), className: "flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium", children: "Cancel" }), _jsx("button", { onClick: () => saveMutation.mutate(form), disabled: !form.name || saveMutation.isPending, className: "flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors", children: saveMutation.isPending ? 'Saving...' : (editCat ? 'Update' : 'Create') })] })] }) }))] }));
}
