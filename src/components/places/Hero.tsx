// Hero.tsx - VERSIÓN COMPLETA CORREGIDA
import React, { useState, useEffect } from 'react';
import { RegionZona } from '../../types/tourism';
import { useImageCache } from '../../hooks/useImageCache';

interface HeroProps {
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
  regionZonaSeleccionada?: RegionZona | null;
  isLoading?: boolean;
}

const Hero: React.FC<HeroProps> = ({ 
  titulo, 
  subtitulo, 
  imagenFondo,
  regionZonaSeleccionada = null,
  isLoading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, ratio: 1 });
  
  // ✅ CACHE MEJORADO: Configuración optimizada para Hero (CORREGIDO)
  const { 
    cachedUrl: imagenCacheada, 
    loading: imageLoading, 
    error: cacheError 
  } = useImageCache(imagenFondo, {
    timeout: 10000, // 10 segundos máximo para Hero
    retries: 2
    // ❌ REMOVED: priority: 'high' - no existe en UseImageCacheOptions
  });

  // DEBUG: Verificar en Hero
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Hero - DEBUG IMÁGENES:');
      console.log('imagenFondo (prop):', imagenFondo);
      console.log('imagenCacheada (cache):', imagenCacheada);
      console.log('imageLoading:', imageLoading);
      console.log('cacheError:', cacheError);
      console.log('isLoading (prop):', isLoading);
      console.log('imageLoaded (estado):', imageLoaded);
      console.log('imageError (estado):', imageError);
    }
  }, [imagenFondo, imagenCacheada, imageLoading, cacheError, isLoading, imageLoaded, imageError]);

  // ✅ URL FINAL: Estrategia mejorada con fallbacks
  const imagenParaMostrar = React.useMemo(() => {
    if (imagenCacheada) return imagenCacheada;
    if (imagenFondo) return imagenFondo;
    
    // Fallback absoluto si no hay imagen
    return '/assets/imagenes/portadas/p_ischigualasto.jpg';
  }, [imagenCacheada, imagenFondo]);

  // ✅ Determinar títulos dinámicos
  const tituloParaMostrar = React.useMemo(() => 
    regionZonaSeleccionada 
      ? `Explorá ${regionZonaSeleccionada.nombre_region_zona}` 
      : titulo,
    [regionZonaSeleccionada, titulo]
  );
  
  const subtituloParaMostrar = React.useMemo(() =>
    regionZonaSeleccionada
      ? `Descubrí los mejores lugares de ${regionZonaSeleccionada.nombre_region_zona}`
      : subtitulo,
    [regionZonaSeleccionada, subtitulo]
  );

  // ✅ Detectar dimensiones de la imagen
  const handleImageLoad = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const ratio = width / height;
    
    setImageInfo({ width, height, ratio });
    setImageLoaded(true);
    setImageError(false);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Hero - Imagen cargada exitosamente:', { 
        width, 
        height, 
        ratio,
        src: img.src 
      });
    }
  }, []);

  const handleImageError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ Hero - Error cargando imagen:', {
      attemptedUrl: imagenParaMostrar,
      cacheUrl: imagenCacheada,
      originalUrl: imagenFondo
    });
    setImageError(true);
    setImageLoaded(true); // Para que no quede en loading eterno
  }, [imagenParaMostrar, imagenCacheada, imagenFondo]);

  // ✅ Calcular estilo adaptativo
  const getAdaptiveStyles = React.useCallback(() => {
    const { width, height, ratio } = imageInfo;
    
    if (width === 0 || height === 0) {
      return {
        container: 'h-[50vh] min-h-[400px] max-h-[600px]',
        image: 'object-cover',
        overlay: 'bg-opacity-50'
      };
    }

    const isSmall = width < 500 || height < 300;
    const isLarge = width > 1500 || height > 1000;
    const isTall = ratio < 0.7;
    const isWide = ratio > 1.5;

    let containerHeight = 'h-[55vh] min-h-[450px] max-h-[700px]';
    if (isSmall) containerHeight = 'h-[45vh] min-h-[350px] max-h-[500px]';
    if (isLarge) containerHeight = 'h-[65vh] min-h-[550px] max-h-[800px]';
    if (isTall) containerHeight = 'h-[70vh] min-h-[500px] max-h-[900px]';

    let imageStrategy = 'object-cover';
    if (isLarge && isTall) imageStrategy = 'object-contain';
    if (isWide) imageStrategy = 'object-cover';

    let overlayOpacity = 'bg-opacity-50';
    if (isSmall) overlayOpacity = 'bg-opacity-60';
    if (isLarge) overlayOpacity = 'bg-opacity-40';
    if (isTall) overlayOpacity = 'bg-opacity-30';

    return { 
      container: containerHeight, 
      image: imageStrategy, 
      overlay: overlayOpacity 
    };
  }, [imageInfo]);

  const adaptiveStyles = getAdaptiveStyles();

  // ✅ Reset estados cuando cambia la imagen
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageInfo({ width: 0, height: 0, ratio: 1 });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Hero - Reset estados por cambio de imagen:', imagenFondo);
    }
  }, [imagenFondo]);

  // ✅ Efecto de aparición cuando cambia el contenido
  useEffect(() => {
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [tituloParaMostrar, subtituloParaMostrar, regionZonaSeleccionada, imagenFondo]);

  // ✅ Verificar si la imagen es válida
  const imagenEsValida = imagenParaMostrar && !imageError && !cacheError;

  // ✅ Estado de loading combinado (prop externa + estado interno)
  const estaCargando = isLoading || imageLoading || (!imageLoaded && imagenEsValida && !imageError);

  // ✅ Preload image para mejor performance
  useEffect(() => {
    if (imagenParaMostrar && !imageLoaded && !imageError) {
      const img = new Image();
      img.src = imagenParaMostrar;
      img.onload = () => {
        setImageInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight
        });
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
    }
  }, [imagenParaMostrar, imageLoaded, imageError]);

  return (
    <div className="relative bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div 
          className={`
            relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl 
            flex items-center justify-center bg-gray-800 
            ${adaptiveStyles.container}
            transition-all duration-300
          `}
        >
          
          {/* Loading principal desde Home */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-30">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white border-t-2 border-t-transparent"></div>
                <p className="text-white text-base font-medium drop-shadow-md text-center px-4">
                  Cargando experiencia turística...
                </p>
              </div>
            </div>
          )}

          {/* Imagen principal - SOLO SI ES VÁLIDA Y NO ESTÁ CARGANDO EXTERNAMENTE */}
          {!isLoading && imagenEsValida && (
            <img 
              src={imagenParaMostrar}
              alt={tituloParaMostrar}
              className={`
                w-full h-full transition-all duration-700 ease-out
                ${adaptiveStyles.image}
                ${imageLoaded && !estaCargando ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
                ${imageLoading ? 'blur-sm' : 'blur-0'}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
              decoding="async"
            />
          )}
          
          {/* Overlay adaptativo - OCULTO DURANTE LOADING EXTERNO */}
          {!isLoading && (
            <div 
              className={`
                absolute inset-0 bg-black transition-all duration-500
                ${adaptiveStyles.overlay}
                ${imageLoaded && !estaCargando ? 'opacity-100' : 'opacity-0'}
              `}
            ></div>
          )}

          {/* Contenido de texto - CENTRADO - OCULTO DURANTE LOADING EXTERNO */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">
                {/* Título con animación suave */}
                <h1 
                  className={`
                    text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white 
                    mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl leading-tight
                    transition-all duration-700 ease-out transform
                    ${isVisible && imageLoaded && !estaCargando && imagenEsValida
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                    }
                  `}
                >
                  {tituloParaMostrar}
                </h1>
                
                {/* Subtítulo con animación suave y escalonada */}
                <p 
                  className={`
                    text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 
                    mb-4 sm:mb-6 md:mb-8 drop-shadow-lg leading-relaxed
                    transition-all duration-700 ease-out transform delay-200
                    ${isVisible && imageLoaded && !estaCargando && imagenEsValida
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                    }
                  `}
                >
                  {subtituloParaMostrar}
                </p>

                {/* Badge de región con animación suave */}
                {regionZonaSeleccionada && (
                  <div 
                    className={`
                      inline-flex items-center space-x-2 bg-black bg-opacity-75 backdrop-blur-sm 
                      rounded-full px-4 py-2 sm:px-5 sm:py-3 border border-white border-opacity-30 shadow-lg
                      transition-all duration-700 ease-out transform delay-400
                      ${isVisible && imageLoaded && !estaCargando && imagenEsValida
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95'
                      }
                    `}
                  >
                    <span className="text-yellow-400 text-lg sm:text-xl">📍</span>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-white whitespace-nowrap">
                      Explorando: {regionZonaSeleccionada.nombre_region_zona}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading interno - SOLO SI NO HAY LOADING EXTERNO */}
          {!isLoading && estaCargando && imagenEsValida && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-25">
              <div className="flex flex-col items-center space-y-3 bg-black bg-opacity-50 rounded-2xl p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white border-t-2 border-t-transparent"></div>
                <p className="text-white text-sm drop-shadow-md text-center">
                  {imageLoading ? 'Optimizando imagen...' : 'Preparando vista...'}
                </p>
                <div className="w-32 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-white animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error state - MEJORADO - SOLO SI NO HAY LOADING EXTERNO */}
          {!isLoading && (!imagenEsValida || imageError || cacheError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 z-20">
              <div className="text-center text-white p-6 max-w-md">
                <div className="text-5xl mb-4">🏞️</div>
                <h3 className="text-xl font-semibold mb-3">Imagen del destino</h3>
                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                  {tituloParaMostrar}
                </p>
                <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-3 mt-4">
                  <p className="text-yellow-200 text-sm">
                    {cacheError ? 'Error de carga' : 'Imagen no disponible'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DEBUG overlay (solo desarrollo) */}
          {process.env.NODE_ENV === 'development' && !isLoading && (
            <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs p-2 rounded z-30">
              <div>🖼️ {imagenEsValida ? 'OK' : 'ERROR'}</div>
              <div>📏 {imageInfo.width}x{imageInfo.height}</div>
              <div>⚡ {imageLoaded ? 'Cargada' : 'Cargando'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;