import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminAPI } from '../lib/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';
export default function ProductModal({ product, onClose, onSuccess }) {
    const isEditing = !!product;
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        shortDescription: product?.shortDescription || '',
        price: product?.price || '',
        comparePrice: product?.comparePrice || '',
        stock: product?.stock ?? '',
        brand: product?.brand || '',
        category: product?.category?._id || product?.category || '',
        isFeatured: product?.isFeatured || false,
        isActive: product?.isActive !== undefined ? product.isActive : true,
        tags: product?.tags?.join(', ') || '',
    });
    const [images, setImages] = useState((product?.images || []).map((img) => ({
        url: img.url || img,
        alt: img.alt || '',
        isPrimary: img.isPrimary || false,
    })));
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => adminAPI.getCategories(),
    });
    const categories = categoriesData?.data?.data || [];
    const mutation = useMutation({
        mutationFn: (data) => isEditing ? adminAPI.updateProduct(product._id, data) : adminAPI.createProduct(data),
        onSuccess: () => {
            toast.success(isEditing ? 'Product updated!' : 'Product created!');
            onSuccess();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to save product'),
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (images.some(img => img.uploading)) {
            toast.error('Please wait for images to finish uploading');
            return;
        }
        // Ensure at least one image has isPrimary
        const finalImages = images.map((img, i) => ({
            url: img.url,
            alt: img.alt || form.name,
            isPrimary: images.some(x => x.isPrimary) ? img.isPrimary : i === 0,
        })).filter(img => img.url);
        mutation.mutate({
            ...form,
            price: parseFloat(form.price),
            comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
            stock: parseInt(form.stock),
            tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
            images: finalImages,
        });
    };
    const field = (key, label, props = {}) => (_jsxs("div", { className: props.full ? 'sm:col-span-2' : '', children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: [label, props.required && ' *'] }), props.textarea ? (_jsx("textarea", { value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })), rows: props.rows || 4, required: props.required, placeholder: props.placeholder, className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 resize-none" })) : (_jsx("input", { type: props.type || 'text', value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })), required: props.required, placeholder: props.placeholder, min: props.min, step: props.step, className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" }))] }));
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: isEditing ? 'Edit Product' : 'Add New Product' }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-xl transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "overflow-y-auto flex-1", children: [_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4", children: "Basic Information" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [field('name', 'Product Name', { required: true, full: true, placeholder: 'e.g. Nike Air Max 270' }), field('shortDescription', 'Short Description', { full: true, placeholder: 'One-line summary shown in listings' }), field('description', 'Full Description', { required: true, full: true, textarea: true, rows: 4, placeholder: 'Detailed product description…' })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4", children: "Pricing & Inventory" }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [field('price', 'Price *', { type: 'number', required: true, min: '0', step: '0.01', placeholder: '0.00' }), field('comparePrice', 'Compare Price', { type: 'number', min: '0', step: '0.01', placeholder: 'Original / Strikethrough' }), field('stock', 'Stock *', { type: 'number', required: true, min: '0', placeholder: '0' }), field('brand', 'Brand', { placeholder: 'e.g. Nike' })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4", children: "Category & Tags" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Category *" }), _jsxs("select", { value: form.category, onChange: e => setForm(p => ({ ...p, category: e.target.value })), required: true, className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white", children: [_jsx("option", { value: "", children: "Select a category\u2026" }), categories.map((cat) => (_jsxs("option", { value: cat._id, children: [cat.icon, " ", cat.name] }, cat._id)))] })] }), field('tags', 'Tags', { placeholder: 'wireless, bluetooth, audio (comma-separated)' })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4", children: ["Product Images", _jsx("span", { className: "ml-2 text-xs font-normal normal-case text-gray-400", children: "First image = main listing photo" })] }), _jsx(ImageUploader, { images: images, onChange: setImages, maxImages: 10 })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4", children: "Visibility" }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("label", { className: "flex items-center gap-2.5 cursor-pointer", children: [_jsx("div", { onClick: () => setForm(p => ({ ...p, isActive: !p.isActive })), className: `w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.isActive ? 'bg-gray-900' : 'bg-gray-200'}`, children: _jsx("div", { className: `absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}` }) }), _jsx("span", { className: "text-sm text-gray-700 font-medium", children: "Active (visible in store)" })] }), _jsxs("label", { className: "flex items-center gap-2.5 cursor-pointer", children: [_jsx("div", { onClick: () => setForm(p => ({ ...p, isFeatured: !p.isFeatured })), className: `w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.isFeatured ? 'bg-amber-500' : 'bg-gray-200'}`, children: _jsx("div", { className: `absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}` }) }), _jsx("span", { className: "text-sm text-gray-700 font-medium", children: "\u2B50 Featured on homepage" })] })] })] })] }), _jsxs("div", { className: "flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 rounded-b-2xl", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 border border-gray-200 bg-white text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: mutation.isPending || images.some(i => i.uploading), className: "flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2", children: [(mutation.isPending || images.some(i => i.uploading)) && (_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" })), isEditing ? 'Update Product' : 'Create Product'] })] })] })] }) }));
}
