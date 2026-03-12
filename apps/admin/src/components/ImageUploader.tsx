import { useState, useRef, useCallback } from 'react';
import { Upload, X, Star, Image, Loader2 } from 'lucide-react';
import { adminAPI, imgUrl } from '../lib/api';
import toast from 'react-hot-toast';

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  file?: File;
  preview?: string;
  uploading?: boolean;
}

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: File[]) => {
    const remaining = maxImages - images.length;
    const toUpload = files.slice(0, remaining);

    // Add previews immediately
    const previews: ProductImage[] = toUpload.map((file, i) => ({
      url: '',
      alt: file.name.replace(/\.[^.]+$/, ''),
      isPrimary: images.length === 0 && i === 0,
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));
    onChange([...images, ...previews]);

    // Upload each
    const uploaded = await Promise.all(
      toUpload.map(async (file, i) => {
        try {
          const form = new FormData();
          form.append('images', file);
          const { data } = await adminAPI.upload(form);
          return { ...previews[i], url: data.urls[0], uploading: false };
        } catch {
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      })
    );

    const successful = uploaded.filter(Boolean) as ProductImage[];
    onChange([
      ...images,
      ...successful,
    ]);
  }, [images, onChange, maxImages]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) { toast.error('Please select image files only'); return; }
    uploadFiles(valid);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) { toast.error('Please enter a valid URL'); return; }
    if (images.length >= maxImages) { toast.error(`Maximum ${maxImages} images allowed`); return; }
    onChange([...images, { url, alt: '', isPrimary: images.length === 0 }]);
    setUrlInput('');
  };

  const handleRemove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    // Ensure there's a primary if we removed it
    if (next.length > 0 && !next.some(i => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  };

  const handleSetPrimary = (idx: number) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  const handleAltChange = (idx: number, alt: string) => {
    onChange(images.map((img, i) => i === idx ? { ...img, alt } : img));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging ? 'border-gray-900 bg-gray-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Drop images here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each · Max {maxImages} images</p>
          <p className="text-xs text-gray-400">{images.length}/{maxImages} uploaded</p>
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            placeholder="Or paste an image URL…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Add URL
        </button>
      </div>

      {/* Image grid preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${img.isPrimary ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}>
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                {img.uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <img
                    src={img.preview || imgUrl(img.url)}
                    alt={img.alt || `Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Main
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isPrimary && !img.uploading && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    title="Set as primary"
                    className="w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-100 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Remove"
                  className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Alt text input */}
              <div className="p-1.5 bg-white border-t border-gray-100">
                <input
                  type="text"
                  value={img.alt}
                  onChange={e => handleAltChange(idx, e.target.value)}
                  placeholder="Alt text…"
                  className="w-full text-xs border-0 outline-none text-gray-600 placeholder-gray-300 bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Star className="w-3 h-3" /> Click the star icon on an image to set it as the main product photo shown in listings.
        </p>
      )}
    </div>
  );
}
