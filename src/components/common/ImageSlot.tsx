import React, { useState } from 'react';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ImageUploadModal } from './ImageUploadModal';

interface ImageSlotProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto';
  label?: string;
  allowUpload?: boolean;
  onImageChange?: (newUrl: string) => void;
  variant?: 'event' | 'person' | 'media';
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'video',
  label = 'Real Photo Placeholder',
  allowUpload = true,
  onImageChange,
  variant = 'event'
}) => {
  const { isAdmin } = useAuth();
  const canUpload = Boolean(allowUpload && isAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'video': return 'aspect-16/9';
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-3/4';
      case 'wide': return 'aspect-21/9';
      default: return '';
    }
  };

  const handleUploaded = (url: string) => {
    setImgError(false);
    if (onImageChange) {
      onImageChange(url);
    }
  };

  const hasImage = Boolean(src && !imgError);

  return (
    <>
      <div
        className={`group relative overflow-hidden bg-slate-100 ${getAspectClass()} ${className}`}
      >
        {hasImage ? (
          <>
            <img
              src={src}
              alt={alt}
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            {canUpload && onImageChange && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-sm backdrop-blur-xs cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
            )}
          </>
        ) : (
          <div
            onClick={() => canUpload && setIsModalOpen(true)}
            className={`w-full h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-slate-300 transition-colors ${
              canUpload ? 'cursor-pointer hover:bg-slate-200/60 hover:border-indigo-400' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 mb-2">
              {variant === 'person' ? (
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <p className="text-xs font-semibold text-slate-700 tracking-tight">{label}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {canUpload ? 'Click to attach official photo' : 'Official photo pending'}
            </p>

            {canUpload && (
              <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                <Upload className="w-3 h-3" />
                Upload File
              </span>
            )}
          </div>
        )}
      </div>

      {canUpload && (
        <ImageUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onImageUploaded={handleUploaded}
          title={hasImage ? 'Replace Photo' : `Upload ${label}`}
          subtitle="Select the real official photograph from your device."
        />
      )}
    </>
  );
};
