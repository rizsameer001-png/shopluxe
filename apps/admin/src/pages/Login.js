import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { adminAPI } from '../lib/api';
import { useAdminAuth } from '../store/auth';
import toast from 'react-hot-toast';
export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setAuth } = useAdminAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await adminAPI.login(form);
            if (!['admin', 'superadmin'].includes(data.user.role)) {
                setError('Access denied. Admin privileges required.');
                return;
            }
            setAuth(data.user, data.token);
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("div", { className: "inline-flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center", children: _jsx(ShoppingBag, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-xl font-bold text-gray-900", children: "ShopLux" }), _jsx("p", { className: "text-xs text-gray-500 font-medium uppercase tracking-wider", children: "Admin Dashboard" })] })] }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Sign in" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Access your admin panel" })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-8", children: [_jsxs("div", { className: "bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6", children: [_jsxs("p", { className: "text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5", children: [_jsx(AlertCircle, { className: "w-3.5 h-3.5" }), " Demo Credentials"] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs text-amber-700 font-mono", children: "admin@ecommerce.com / admin123" }), _jsxs("p", { className: "text-xs text-amber-600", children: ["Run ", _jsx("code", { className: "bg-amber-100 px-1 rounded", children: "npm run seed" }), " in server to populate demo data"] })] })] }), error && (_jsxs("div", { className: "bg-red-50 border border-red-100 rounded-xl p-3 mb-5 flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-500 flex-shrink-0" }), _jsx("p", { className: "text-sm text-red-700", children: error })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "email", value: form.email, onChange: e => setForm(p => ({ ...p, email: e.target.value })), placeholder: "admin@example.com", required: true, className: "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: form.password, onChange: e => setForm(p => ({ ...p, password: e.target.value })), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, className: "w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2", children: loading ? (_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" })) : ('Sign In to Dashboard') })] })] }), _jsx("p", { className: "text-center text-xs text-gray-400 mt-6", children: "ShopLux Admin v1.0 \u2014 Secured access only" })] }) }));
}
