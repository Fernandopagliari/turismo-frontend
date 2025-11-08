// hooks/useImageCache.ts
import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from './useApi';

// Cache global en memoria
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
const MAX_CACHE_SIZE = 100; // Máximo de imágenes en cache

// Limpiar cache antiguo periódicamente
const cleanupOldCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  imageCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => imageCache.delete(key));
  
  // Limitar tamaño del cache
  if (imageCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(imageCache.entries());
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = sorted.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => imageCache.delete(key));
  }
};

interface UseImageCacheResult {
  cachedUrl: string;
  loading: boolean;
  error: boolean;
}

export const useImageCache = (imagePath: string | null | undefined): UseImageCacheResult => {
  const [state, setState] = useState<UseImageCacheResult>({
    cachedUrl: '',
    loading: true,
    error: false
  });
  
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!imagePath) {
      if (mountedRef.current) {
        setState({ cachedUrl: '', loading: false, error: false });
      }
      return;
    }

    // Limpiar cache antiguo periódicamente
    if (Math.random() < 0.1) {
      cleanupOldCache();
    }

    // Verificar si ya está en cache
    const cached = imageCache.get(imagePath);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      if (mountedRef.current) {
        setState({ cachedUrl: cached.url, loading: false, error: false });
      }
      return;
    }

    // Preload image
    const loadImage = async () => {
      if (!mountedRef.current) return;

      try {
        const imageUrl = getImageUrl(imagePath);
        
        if (!imageUrl || imageUrl === '') {
          throw new Error('URL de imagen inválida');
        }

        const img = new Image();
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(true);
          img.onerror = () => reject(new Error('Error cargando imagen'));
          setTimeout(() => reject(new Error('Timeout cargando imagen')), 15000);
        });

        if (mountedRef.current) {
          imageCache.set(imagePath, { 
            url: imageUrl, 
            timestamp: Date.now() 
          });
          
          setState({ 
            cachedUrl: imageUrl, 
            loading: false, 
            error: false 
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          console.warn(`Error cargando imagen: ${imagePath}`, error);
          setState({ 
            cachedUrl: '', 
            loading: false, 
            error: true 
          });
        }
      }
    };

    loadImage();
  }, [imagePath]);

  return state;
};