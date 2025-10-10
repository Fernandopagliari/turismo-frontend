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
    <div className="relative bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-8 md:py-12">
          
          {/* Contenido de texto */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
              {tituloParaMostrar}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-4">
              {subtituloParaMostrar}
            </p>

            {regionZonaSeleccionada && (
              <div className="inline-flex items-center space-x-2 bg-black bg-opacity-60 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-30">
                <span className="text-yellow-400 text-lg">📍</span>
                <span className="text-sm md:text-base font-medium text-white">
                  Explorando: {regionZonaSeleccionada.nombre_region_zona}
                </span>
              </div>
            )}
          </div>

          {/* Imagen compacta (similar al logo del Header) */}
          <div className="hidden md:block flex-shrink-0 ml-8">
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
              <img 
                src={imagenParaMostrar}
                alt="Imagen destacada"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;