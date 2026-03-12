import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { Upload, X, Star, Image, Loader2 } from 'lucide-react';
import { adminAPI, imgUrl } from '../lib/api';
import toast from 'react-hot-toast';
export default function ImageUploader({ images, onChange, maxImages = 10 }) {
    const [dragging, setDragging] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef(null);
    const uploadFiles = useCallback(async (files) => {
        const remaining = maxImages - images.length;
        const toUpload = files.slice(0, remaining);
        // Add previews immediately
        const previews = toUpload.map((file, i) => ({
            url: '',
            alt: file.name.replace(/\.[^.]+$/, ''),
            isPrimary: images.length === 0 && i === 0,
            file,
            preview: URL.createObjectURL(file),
            uploading: true,
        }));
        onChange([...images, ...previews]);
        // Upload each
        const uploaded = await Promise.all(toUpload.map(async (file, i) => {
            try {
                const form = new FormData();
                form.append('images', file);
                const { data } = await adminAPI.upload(form);
                return { ...previews[i], url: data.urls[0], uploading: false };
            }
            catch {
                toast.error(`Failed to upload ${file.name}`);
                return null;
            }
        }));
        const successful = uploaded.filter(Boolean);
        onChange([
            ...images,
            ...successful,
        ]);
    }, [images, onChange, maxImages]);
    const handleFiles = (files) => {
        if (!files)
            return;
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (valid.length === 0) {
            toast.error('Please select image files only');
            return;
        }
        uploadFiles(valid);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };
    const handleAddUrl = () => {
        const url = urlInput.trim();
        if (!url)
            return;
        if (!url.startsWith('http')) {
            toast.error('Please enter a valid URL');
            return;
        }
        if (images.length >= maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }
        onChange([...images, { url, alt: '', isPrimary: images.length === 0 }]);
        setUrlInput('');
    };
    const handleRemove = (idx) => {
        const next = images.filter((_, i) => i !== idx);
        // Ensure there's a primary if we removed it
        if (next.length > 0 && !next.some(i => i.isPrimary))
            next[0].isPrimary = true;
        onChange(next);
    };
    const handleSetPrimary = (idx) => {
        onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
    };
    const handleAltChange = (idx, alt) => {
        onChange(images.map((img, i) => i === idx ? { ...img, alt } : img));
    };
    return (_jsxs("div", { className: "space-y-4", children: [images.length < maxImages && (_jsxs("div", { onDragOver: e => { e.preventDefault(); setDragging(true); }, onDragLeave: () => setDragging(false), onDrop: handleDrop, onClick: () => fileInputRef.current?.click(), className: `border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-gray-900 bg-gray-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => handleFiles(e.target.files) }), _jsx("div", { className: "w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3", children: _jsx(Upload, { className: "w-6 h-6 text-gray-400" }) }), _jsx("p", { className: "text-sm font-semibold text-gray-700", children: "Drop images here or click to browse" }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: ["PNG, JPG, WEBP up to 5MB each \u00B7 Max ", maxImages, " images"] }), _jsxs("p", { className: "text-xs text-gray-400", children: [images.length, "/", maxImages, " uploaded"] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Image, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "url", value: urlInput, onChange: e => setUrlInput(e.target.value), onKeyDown: e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl()), placeholder: "Or paste an image URL\u2026", className: "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" })] }), _jsx("button", { type: "button", onClick: handleAddUrl, disabled: !urlInput.trim() || images.length >= maxImages, className: "px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors", children: "Add URL" })] }), images.length > 0 && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: images.map((img, idx) => (_jsxs("div", { className: `relative group rounded-xl overflow-hidden border-2 transition-all ${img.isPrimary ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'}`, children: [_jsx("div", { className: "aspect-square bg-gray-100", children: img.uploading ? (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Loader2, { className: "w-6 h-6 text-gray-400 animate-spin" }) })) : (_jsx("img", { src: img.preview || imgUrl(img.url), alt: img.alt || `Image ${idx + 1}`, className: "w-full h-full object-cover" })) }), img.isPrimary && (_jsxs("div", { className: "absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3 fill-white" }), " Main"] })), _jsxs("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: [!img.isPrimary && !img.uploading && (_jsx("button", { type: "button", onClick: () => handleSetPrimary(idx), title: "Set as primary", className: "w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-100 transition-colors", children: _jsx(Star, { className: "w-4 h-4" }) })), _jsx("button", { type: "button", onClick: () => handleRemove(idx), title: "Remove", className: "w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "p-1.5 bg-white border-t border-gray-100", children: _jsx("input", { type: "text", value: img.alt, onChange: e => handleAltChange(idx, e.target.value), placeholder: "Alt text\u2026", className: "w-full text-xs border-0 outline-none text-gray-600 placeholder-gray-300 bg-transparent" }) })] }, idx))) })), images.length > 1 && (_jsxs("p", { className: "text-xs text-gray-400 flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3" }), " Click the star icon on an image to set it as the main product photo shown in listings."] }))] }));
}
