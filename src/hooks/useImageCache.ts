// hooks/useImageCache.ts - VERSIÓN MEJORADA CON OPCIONES
import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from './useApi';

// Cache global en memoria
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
const MAX_CACHE_SIZE = 100;

// Limpiar cache antiguo
const cleanupOldCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  imageCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => imageCache.delete(key));
  
  if (imageCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(imageCache.entries());
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = sorted.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => imageCache.delete(key));
  }
};

interface UseImageCacheOptions {
  timeout?: number; // tiempo en milisegundos
  retries?: number; // número de reintentos
  enabled?: boolean; // si debe cargar la imagen
}

interface UseImageCacheResult {
  cachedUrl: string;
  loading: boolean; // ← este es el equivalente a isLoading
  error: boolean;
  retryCount: number;
}

export const useImageCache = (
  imagePath: string | null | undefined, 
  options: UseImageCacheOptions = {}
): UseImageCacheResult => {
  const {
    timeout = 30000, // 30 segundos por defecto
    retries = 2, // 2 reintentos por defecto
    enabled = true // cargar por defecto
  } = options;

  const [state, setState] = useState<UseImageCacheResult>({
    cachedUrl: '',
    loading: true,
    error: false,
    retryCount: 0
  });
  
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (mountedRef.current) {
        setState({ 
          cachedUrl: '', 
          loading: false, 
          error: false,
          retryCount: 0 
        });
      }
      return;
    }

    if (!imagePath) {
      if (mountedRef.current) {
        setState({ 
          cachedUrl: '', 
          loading: false, 
          error: false,
          retryCount: 0 
        });
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
        setState({ 
          cachedUrl: cached.url, 
          loading: false, 
          error: false,
          retryCount: 0 
        });
      }
      return;
    }

    // Reset retry count para nueva imagen
    retryCountRef.current = 0;

    // Preload image con reintentos
    const loadImage = async (currentRetry = 0) => {
      if (!mountedRef.current) return;

      try {
        const imageUrl = getImageUrl(imagePath);
        
        if (!imageUrl || imageUrl === '') {
          throw new Error('URL de imagen inválida');
        }

        console.log(`🔄 Cache - Cargando imagen: ${imagePath} -> ${imageUrl} (intento ${currentRetry + 1}/${retries + 1})`);
        
        const img = new Image();
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.warn(`⏰ Cache - Timeout cargando imagen: ${imagePath}`);
            reject(new Error('Timeout cargando imagen'));
          }, timeout);

          img.onload = () => {
            clearTimeout(timeoutId);
            console.log(`✅ Cache - Imagen cargada: ${imagePath}`);
            resolve(true);
          };
          
          img.onerror = () => {
            clearTimeout(timeoutId);
            console.error(`❌ Cache - Error cargando imagen: ${imagePath}`);
            reject(new Error('Error cargando imagen'));
          };
        });

        if (mountedRef.current) {
          imageCache.set(imagePath, { 
            url: imageUrl, 
            timestamp: Date.now() 
          });
          
          setState({ 
            cachedUrl: imageUrl, 
            loading: false, 
            error: false,
            retryCount: currentRetry 
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          console.warn(`Cache - Error en intento ${currentRetry + 1} para ${imagePath}:`, error);
          
          // Reintentar si aún tenemos intentos disponibles
          if (currentRetry < retries) {
            const nextRetry = currentRetry + 1;
            retryCountRef.current = nextRetry;
            
            // Esperar antes del reintento (backoff exponencial)
            const backoffDelay = Math.min(1000 * Math.pow(2, currentRetry), 10000);
            console.log(`🔄 Cache - Reintentando en ${backoffDelay}ms...`);
            
            setTimeout(() => {
              if (mountedRef.current) {
                loadImage(nextRetry);
              }
            }, backoffDelay);
            
            // Actualizar estado para mostrar que estamos reintentando
            setState(prev => ({
              ...prev,
              retryCount: nextRetry,
              loading: true
            }));
          } else {
            // No más reintentos, marcar como error
            console.error(`💥 Cache - Error final después de ${retries + 1} intentos para ${imagePath}`);
            setState({ 
              cachedUrl: '', 
              loading: false, 
              error: true,
              retryCount: currentRetry + 1 
            });
          }
        }
      }
    };

    loadImage();
  }, [imagePath, enabled, timeout, retries]);

  return state;
};