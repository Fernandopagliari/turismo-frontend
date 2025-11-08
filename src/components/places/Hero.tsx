// Hero.tsx - VERSIÓN CON CACHE
import React, { useState, useEffect } from 'react';
import { RegionZona } from '../../types/tourism';
import { useApi } from '../../hooks/useApi'; // ✅ Importar el hook
import { useImageCache } from '../../hooks/useImageCache'; // ✅ IMPORTAR HOOK DE CACHE

interface HeroProps {
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
  regionZonaSeleccionada?: RegionZona | null;
}

const Hero: React.FC<HeroProps> = ({ 
  titulo, 
  subtitulo, 
  imagenFondo,
  regionZonaSeleccionada = null
}) => {
  const { getImageUrl } = useApi(); // ✅ Usar el hook
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, ratio: 1 });
  
  // ✅ USAR CACHE PARA LA IMAGEN
  const imagenRegion = regionZonaSeleccionada?.imagen_region_zona_ruta_relativa;
  const { cachedUrl: imagenCacheada, loading: imageLoading } = useImageCache(
    imagenRegion || imagenFondo
  );

  // ✅ Usar getImageUrl del hook (SÍ tiene apiBaseUrl) CON CACHE
  const imagenParaMostrar = imagenCacheada || getImageUrl(
    regionZonaSeleccionada?.imagen_region_zona_ruta_relativa || imagenFondo
  );

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
  };

  // ✅ Calcular estilo adaptativo basado en las dimensiones reales
  const getAdaptiveStyles = () => {
    const { width, height, ratio } = imageInfo;
    
    // Si no tenemos dimensiones, usar valores por defecto
    if (width === 0 || height === 0) {
      return {
        container: 'h-[50vh] min-h-[400px]',
        image: 'object-scale-down',
        overlay: 'bg-opacity-50'
      };
    }

    // Clasificar la imagen por tamaño y proporción
    const isSmall = width < 500 || height < 300;
    const isLarge = width > 1500 || height > 1000;
    const isWide = ratio > 1.5;
    const isTall = ratio < 0.7;
    const isSquare = ratio >= 0.9 && ratio <= 1.1;

    // Determinar altura del contenedor
    let containerHeight = 'h-[55vh] min-h-[450px]';
    if (isSmall) {
      containerHeight = 'h-[45vh] min-h-[350px]';
    } else if (isLarge) {
      containerHeight = 'h-[65vh] min-h-[550px]';
    }

    // Determinar estrategia de imagen
    let imageStrategy = 'object-scale-down';
    if (isLarge && isWide) {
      imageStrategy = 'object-cover'; // Imágenes grandes y anchas pueden recortarse
    } else if (isLarge && isTall) {
      imageStrategy = 'object-contain'; // Imágenes grandes y altas mostrar completas
    }

    // Determinar overlay
    let overlayOpacity = 'bg-opacity-50';
    if (isSmall) {
      overlayOpacity = 'bg-opacity-60'; // Más oscuro para imágenes pequeñas
    } else if (isLarge) {
      overlayOpacity = 'bg-opacity-40'; // Más claro para imágenes grandes
    }

    return {
      container: containerHeight,
      image: imageStrategy,
      overlay: overlayOpacity
    };
  };

  const adaptiveStyles = getAdaptiveStyles();

  // ✅ Efecto de aparición cuando cambia el contenido
  useEffect(() => {
    setIsVisible(false);
    setImageLoaded(false);
    setImageInfo({ width: 0, height: 0, ratio: 1 });
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [tituloParaMostrar, subtituloParaMostrar, regionZonaSeleccionada]);

  return (
    <div className="relative bg-gray-900">
      {/* Contenedor principal con márgenes laterales */}
      <div className="container mx-auto px-6 pt-8">
        <div 
          className={`relative rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-800 ${adaptiveStyles.container}`}
        >
          
          {/* Imagen principal con estrategia adaptativa Y CACHE */}
          <img 
            src={imagenParaMostrar}
            alt={tituloParaMostrar}
            className={`w-full h-full transition-all duration-500 ${adaptiveStyles.image} ${
              imageLoaded && !imageLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={handleImageLoad}
            style={{
              imageRendering: imageInfo.width < 500 ? 'crisp-edges' : 'auto',
            }}
          />
          
          {/* Overlay adaptativo */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${adaptiveStyles.overlay}`}></div>

          {/* Contenido de texto - CENTRADO */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-6 max-w-4xl mx-auto">
              {/* Título con animación suave */}
              <h1 
                className={`
                  text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl
                  transition-all duration-1000 ease-out transform
                  ${isVisible && imageLoaded && !imageLoading
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
                  ${isVisible && imageLoaded && !imageLoading
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
                    ${isVisible && imageLoaded && !imageLoading
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

          {/* Loading sutil - MEJORADO CON CACHE */}
          {(imageLoading || !imageLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                <p className="text-white text-sm drop-shadow-md">
                  {imageLoading ? 'Cargando imagen...' : 'Procesando...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;