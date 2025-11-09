// Hero.tsx - VERSIÓN CORREGIDA CON USO CORRECTO DEL HOOK
import React, { useState, useEffect } from 'react';
import { RegionZona } from '../../types/tourism';
import { useImageCache } from '../../hooks/useImageCache';

interface HeroProps {
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
  regionZonaSeleccionada?: RegionZona | null;
  isLoading?: boolean; // ← Prop externa para control de loading desde Home
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
  
  // ✅ CACHE MEJORADO: Usar opciones configurables
  const { 
    cachedUrl: imagenCacheada, 
    loading: imageLoading, // ← este es el estado interno de carga del hook
    error: cacheError,
    retryCount 
  } = useImageCache(imagenFondo, {
    timeout: 30000, // 30 segundos
    retries: 2,     // 2 reintentos
    enabled: !isLoading // No cargar si ya está en loading externo
  });

  // DEBUG: Verificar en Hero
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Hero - DEBUG IMÁGENES:');
      console.log('imagenFondo (prop):', imagenFondo);
      console.log('imagenCacheada (cache):', imagenCacheada);
      console.log('imageLoading (hook):', imageLoading);
      console.log('cacheError:', cacheError);
      console.log('retryCount:', retryCount);
      console.log('isLoading (prop externa):', isLoading);
    }
  }, [imagenFondo, imagenCacheada, imageLoading, cacheError, retryCount, isLoading]);

  // ✅ URL FINAL: Priorizar cache, luego prop directa
  const imagenParaMostrar = imagenCacheada || imagenFondo;

  // ✅ Determinar títulos dinámicos
  const tituloParaMostrar = regionZonaSeleccionada 
    ? `Explorá ${regionZonaSeleccionada.nombre_region_zona}` 
    : titulo;
  
  const subtituloParaMostrar = regionZonaSeleccionada
    ? `Descubrí los mejores lugares de ${regionZonaSeleccionada.nombre_region_zona}`
    : subtitulo;

  // ✅ Detectar dimensiones de la imagen
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const ratio = width / height;
    
    setImageInfo({ width, height, ratio });
    setImageLoaded(true);
    setImageError(false);
    console.log('✅ Hero - Imagen cargada exitosamente:', { width, height, ratio });
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ Hero - Error cargando imagen:', imagenParaMostrar);
    setImageError(true);
    setImageLoaded(true); // Para que no quede en loading eterno
  };

  // ✅ Calcular estilo adaptativo
  const getAdaptiveStyles = () => {
    const { width, height, ratio } = imageInfo;
    
    if (width === 0 || height === 0) {
      return {
        container: 'h-[50vh] min-h-[400px]',
        image: 'object-cover',
        overlay: 'bg-opacity-50'
      };
    }

    const isSmall = width < 500 || height < 300;
    const isLarge = width > 1500 || height > 1000;
    const isTall = ratio < 0.7;

    let containerHeight = 'h-[55vh] min-h-[450px]';
    if (isSmall) containerHeight = 'h-[45vh] min-h-[350px]';
    if (isLarge) containerHeight = 'h-[65vh] min-h-[550px]';

    let imageStrategy = 'object-cover';
    if (isLarge && isTall) imageStrategy = 'object-contain';

    let overlayOpacity = 'bg-opacity-50';
    if (isSmall) overlayOpacity = 'bg-opacity-60';
    if (isLarge) overlayOpacity = 'bg-opacity-40';

    return { container: containerHeight, image: imageStrategy, overlay: overlayOpacity };
  };

  const adaptiveStyles = getAdaptiveStyles();

  // ✅ Efecto de aparición cuando cambia el contenido
  useEffect(() => {
    setIsVisible(false);
    setImageLoaded(false);
    setImageError(false);
    setImageInfo({ width: 0, height: 0, ratio: 1 });
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [tituloParaMostrar, subtituloParaMostrar, regionZonaSeleccionada, imagenFondo]);

  // ✅ Verificar si la imagen es válida
  const imagenEsValida = imagenParaMostrar && !imageError && !cacheError;

  // ✅ Estado de loading combinado
  const estaCargando = isLoading || imageLoading || (!imageLoaded && imagenEsValida);

  return (
    <div className="relative bg-gray-900">
      <div className="container mx-auto px-6 pt-8">
        <div 
          className={`relative rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-800 ${adaptiveStyles.container}`}
        >
          
          {/* Loading principal desde Home */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white border-t-2 border-t-transparent"></div>
                <p className="text-white text-lg font-medium drop-shadow-md">
                  Cargando experiencia...
                </p>
              </div>
            </div>
          )}

          {/* Imagen principal - SOLO SI NO ESTÁ CARGANDO EXTERNAMENTE */}
          {!isLoading && imagenEsValida && (
            <img 
              src={imagenParaMostrar}
              alt={tituloParaMostrar}
              className={`w-full h-full transition-all duration-500 ${adaptiveStyles.image} ${
                imageLoaded && !estaCargando ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* Overlay adaptativo - OCULTO DURANTE LOADING EXTERNO */}
          {!isLoading && (
            <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${adaptiveStyles.overlay}`}></div>
          )}

          {/* Contenido de texto - CENTRADO - OCULTO DURANTE LOADING EXTERNO */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center px-6 max-w-4xl mx-auto">
                {/* Título con animación suave */}
                <h1 
                  className={`
                    text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl
                    transition-all duration-1000 ease-out transform
                    ${isVisible && imageLoaded && !estaCargando && imagenEsValida
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-6'
                    }
                  `}
                >
                  {tituloParaMostrar}
                </h1>
                
                {/* Subtítulo con animación suave y escalonada */}
                <p 
                  className={`
                    text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 md:mb-8 drop-shadow-lg leading-relaxed
                    transition-all duration-1000 ease-out transform delay-300
                    ${isVisible && imageLoaded && !estaCargando && imagenEsValida
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-6'
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
                      rounded-full px-5 py-3 border border-white border-opacity-30 shadow-lg
                      transition-all duration-1000 ease-out transform delay-600
                      ${isVisible && imageLoaded && !estaCargando && imagenEsValida
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-6'
                      }
                    `}
                  >
                    <span className="text-yellow-400 text-xl">📍</span>
                    <span className="text-base md:text-lg font-semibold text-white">
                      Explorando: {regionZonaSeleccionada.nombre_region_zona}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading interno - SOLO SI NO HAY LOADING EXTERNO */}
          {!isLoading && estaCargando && imagenEsValida && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-15">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-white text-sm drop-shadow-md">
                  {imageLoading ? `Cargando imagen... ${retryCount > 0 ? `(Reintento ${retryCount})` : ''}` : 'Procesando...'}
                </p>
              </div>
            </div>
          )}

          {/* Error state - MEJORADO - SOLO SI NO HAY LOADING EXTERNO */}
          {!isLoading && (!imagenEsValida || imageError || cacheError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <div className="text-center text-white p-8">
                <div className="text-6xl mb-4">🏞️</div>
                <h3 className="text-xl font-semibold mb-2">Imagen no disponible</h3>
                <p className="text-gray-300 text-sm">
                  {tituloParaMostrar}
                </p>
                {retryCount > 0 && (
                  <p className="text-yellow-400 text-xs mt-2">
                    Se intentó cargar {retryCount + 1} veces
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;