import React from 'react';
import { RegionZona } from '../../types/tourism';
import { getImageUrl } from '../../hooks/useApi';

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
  const imagenParaMostrar = regionZonaSeleccionada?.imagen_region_zona_ruta_relativa || imagenFondo;
  const imagenCorregida = getImageUrl(imagenParaMostrar);

  // DEBUG TEMPORAL
  console.log('🎯 Hero - Imagen original:', imagenParaMostrar);
  console.log('🎯 Hero - Imagen corregida:', imagenCorregida);

  const tituloParaMostrar = regionZonaSeleccionada 
    ? `Explorá ${regionZonaSeleccionada.nombre_region_zona}` 
    : titulo;
  
  const subtituloParaMostrar = regionZonaSeleccionada
    ? `Descubrí los mejores lugares de ${regionZonaSeleccionada.nombre_region_zona}`
    : subtitulo;

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Imagen de fondo CON getImageUrl */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `url(${imagenCorregida})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1f2937'
        }}
      />
      
      {/* Overlay para mejor contraste y legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Contenido centrado CON ANIMACIONES */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 drop-shadow-2xl animate-fade-in">
          {tituloParaMostrar}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl drop-shadow-lg animate-fade-in-delayed mb-2">
          {subtituloParaMostrar}
        </p>

        {/* Badge de región seleccionada CON ANIMACIÓN */}
        {regionZonaSeleccionada && (
          <div className="mt-4 inline-flex items-center space-x-2 bg-black bg-opacity-70 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-30 animate-slide-up">
            <span className="text-yellow-400 text-lg">📍</span>
            <span className="text-sm md:text-base font-medium">
              Explorando: {regionZonaSeleccionada.nombre_region_zona}
            </span>
          </div>
        )}
      </div>

      {/* Gradiente suave en los bordes para transición */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-gray-900 to-transparent"></div>
    </div>
  );
};

export default Hero;