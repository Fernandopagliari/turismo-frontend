// hooks/useImagePreloader.ts
import { useImageCache } from './useImageCache';

export const useImagePreloader = (imagePaths: (string | null | undefined)[]) => {
  const results = imagePaths.map(path => useImageCache(path));
  
  const allLoaded = results.every(result => !result.loading);
  const anyError = results.some(result => result.error);
  const loadedCount = results.filter(result => !result.loading && !result.error).length;
  
  return {
    results,
    allLoaded,
    anyError,
    loadedCount,
    total: imagePaths.length
  };
};