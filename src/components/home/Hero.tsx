import React from 'react';
import { RegionZona } from '../../types/tourism';

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

  const tituloParaMostrar = regionZonaSeleccionada 
    ? `Explorá ${regionZonaSeleccionada.nombre_region_zona}` 
    : titulo;
  
  const subtituloParaMostrar = regionZonaSeleccionada
    ? `Descubrí los mejores lugares de ${regionZonaSeleccionada.nombre_region_zona}`
    : subtitulo;

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-900 overflow-hidden">
      
      {/* ✅ SOLUCIÓN: Imagen como img tag - igual que el Header */}
      <img 
        src={imagenParaMostrar}
        alt="Fondo hero"
        className="absolute inset-0 w-full h-full object-cover" // ✅ object-cover en lugar de background-size
      />
      
      {/* Overlay suave */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 drop-shadow-2xl">
          {tituloParaMostrar}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl drop-shadow-lg mb-2">
          {subtituloParaMostrar}
        </p>

        {regionZonaSeleccionada && (
          <div className="mt-4 inline-flex items-center space-x-2 bg-black bg-opacity-60 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-30">
            <span className="text-yellow-400 text-lg">📍</span>
            <span className="text-sm md:text-base font-medium">
              Explorando: {regionZonaSeleccionada.nombre_region_zona}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;