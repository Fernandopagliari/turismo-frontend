import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { useImageCache } from '../../hooks/useImageCache'; // ✅ IMPORTAR HOOK DE CACHE

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  cachedUrl?: string; // ✅ AGREGAR URL CACHEADA
  loading?: boolean; // ✅ AGREGAR ESTADO DE CARGA
}

interface ImageGalleryProps {
  imagenes: string[];
  titulo: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ imagenes, titulo }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [imagenActiva, setImagenActiva] = useState(0);

  // Función para determinar si es video o imagen
  const getMediaType = (url: string): 'image' | 'video' => {
    if (!url) return 'image';
    const extension = url.toLowerCase().split('.').pop();
    return extension === 'mp4' || extension === 'webm' || extension === 'ogg' ? 'video' : 'image';
  };

  // ✅ USAR CACHE PARA TODAS LAS IMÁGENES
  const mediosConCache: MediaItem[] = imagenes
    .filter(url => url && !url.includes('null'))
    .map(url => {
      const type = getMediaType(url);
      // ✅ SOLO USAR CACHE PARA IMÁGENES, NO PARA VIDEOS
      if (type === 'image') {
        const { cachedUrl, loading } = useImageCache(url);
        return {
          url,
          type,
          cachedUrl,
          loading
        };
      } else {
        return {
          url,
          type,
          cachedUrl: url, // ✅ VIDEOS USAN URL DIRECTA
          loading: false
        };
      }
    });

  if (mediosConCache.length === 0) {
    return (
      <div className="bg-gray-800 h-64 rounded-lg flex items-center justify-center border border-gray-700">
        <span className="text-gray-400">No hay medios disponibles</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Swiper principal */}
      <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        navigation
        pagination={{ clickable: true }}
        thumbs={{ swiper: thumbsSwiper }}
        className="rounded-lg h-64 md:h-80 bg-gray-800"
        onSlideChange={(swiper) => setImagenActiva(swiper.activeIndex)}
      >
        {mediosConCache.map((medio, index) => (
          <SwiperSlide key={index}>
            {medio.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center">
                <video 
                  controls 
                  className="max-w-full max-h-full object-contain"
                  poster="/video-poster.jpg"
                >
                  <source src={medio.url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src={medio.cachedUrl || medio.url} // ✅ USAR URL CACHEADA
                  alt={`${titulo} ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    medio.loading ? 'opacity-50' : 'opacity-100'
                  }`}
                />
                {/* ✅ INDICADOR DE CARGA PARA IMÁGENES */}
                {medio.loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Miniaturas para desktop */}
      <div className="hidden md:block">
        <Swiper
          modules={[Thumbs]}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
          spaceBetween={10}
          className="thumbnails"
        >
          {mediosConCache.map((medio, index) => (
            <SwiperSlide key={index}>
              <div className={`cursor-pointer border-2 ${
                imagenActiva === index ? 'border-blue-500' : 'border-transparent'
              }`}>
                {medio.type === 'video' ? (
                  <div className="relative w-full h-20 bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-2xl">🎬</span>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 rounded-full w-5 h-5 flex items-center justify-center">
                      <span className="text-white text-xs">▶</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-20">
                    <img 
                      src={medio.cachedUrl || medio.url} // ✅ USAR URL CACHEADA
                      alt={`${titulo} ${index + 1}`}
                      className={`w-full h-20 object-cover transition-opacity duration-300 ${
                        medio.loading ? 'opacity-50' : 'opacity-100'
                      }`}
                    />
                    {/* ✅ INDICADOR DE CARGA PARA MINIATURAS */}
                    {medio.loading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Indicador de medios para móvil */}
      <div className="text-center text-sm text-gray-400 md:hidden">
        Medio {imagenActiva + 1} de {mediosConCache.length}
        {mediosConCache[imagenActiva]?.type === 'video' && ' 🎬'}
      </div>
    </div>
  );
};

export default ImageGallery;