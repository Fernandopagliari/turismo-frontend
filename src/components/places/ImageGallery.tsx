import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
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

  // Crear array de medios (imágenes + videos)
  const medios: MediaItem[] = imagenes
    .filter(url => url && !url.includes('null'))
    .map(url => ({
      url,
      type: getMediaType(url)
    }));

  if (medios.length === 0) {
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
        {medios.map((medio, index) => (
          <SwiperSlide key={index}>
            {medio.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center">
                <video 
                  controls 
                  className="max-w-full max-h-full object-contain"
                  poster="/video-poster.jpg" // Imagen de placeholder para el video
                >
                  <source src={medio.url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            ) : (
              <img 
                src={medio.url} 
                alt={`${titulo} ${index + 1}`}
                className="w-full h-full object-cover"
              />
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
          {medios.map((medio, index) => (
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
                  <img 
                    src={medio.url} 
                    alt={`${titulo} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Indicador de medios para móvil */}
      <div className="text-center text-sm text-gray-400 md:hidden">
        Medio {imagenActiva + 1} de {medios.length}
        {medios[imagenActiva]?.type === 'video' && ' 🎬'}
      </div>
    </div>
  );
};

export default ImageGallery;