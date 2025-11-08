// components/common/CachedImage.tsx
import React from 'react';
import { useImageCache } from '../../hooks/useImageCache';

interface CachedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
  onLoad?: () => void;
  onError?: () => void;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/assets/images/placeholder.jpg',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const { cachedUrl, loading: imageLoading, error } = useImageCache(src);

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  const handleError = () => {
    if (onError) onError();
  };

  const displaySrc = error ? fallbackSrc : (cachedUrl || fallbackSrc);

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={`${className} ${imageLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};