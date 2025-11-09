import React from 'react';
import { SubSeccion } from '../../types/tourism';
import { useImageCache } from '../../hooks/useImageCache'; // ✅ Importar el hook de cache

interface PlaceCardProps {
  lugar: SubSeccion;
  onClick: (lugar: SubSeccion) => void;
  mostrarCategoria?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ lugar, onClick, mostrarCategoria = true }) => {
  // ✅ USAR CACHE PARA LA IMAGEN
  const { cachedUrl, loading: imageLoading } = useImageCache(lugar.imagen_ruta_relativa);

  // Función para formatear teléfono (igual que en PlaceDetail)
  const formatearTelefono = (telefono: string): string => {
    return telefono.replace(/[\s\-\(\)]/g, '');
  };

  const esTelefonoValido = (telefono: string): boolean => {
    const numeroLimpio = formatearTelefono(telefono);
    return /^\d{8,15}$/.test(numeroLimpio);
  };

  const telefonoValido = lugar.numero_telefono && esTelefonoValido(lugar.numero_telefono);

  // Evitar que el click del teléfono propague al card
  const handleTelefonoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 fade-in border border-gray-700"
      onClick={() => onClick(lugar)}
    >
      {/* Imagen principal CON CACHE */}
      <div className="h-48 overflow-hidden">
        <img 
          src={cachedUrl || '/placeholder.jpg'} // ✅ Usar URL en cache
          alt={lugar.nombre_sub_seccion}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
            imageLoading ? 'opacity-50' : 'opacity-100' // ✅ Feedback de carga
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
          }}
        />
        {/* ✅ Mostrar indicador de carga */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Nombre del lugar */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">{lugar.nombre_sub_seccion}</h3>
        
        {/* Domicilio */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-1">{lugar.domicilio}</p>
        
        {/* Teléfono con click-to-call */}
        {telefonoValido && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 text-sm">📞 Teléfono:</span>
            <a 
              href={`tel:${formatearTelefono(lugar.numero_telefono)}`}
              onClick={handleTelefonoClick}
              className="text-green-300 hover:text-green-200 text-sm font-mono bg-green-900 bg-opacity-30 px-2 py-1 rounded transition-colors"
            >
              {lugar.numero_telefono}
            </a>
          </div>
        )}
        
        {/* Botón de WhatsApp en el card (opcional) */}
        {telefonoValido && (
          <a 
            href={`https://wa.me/${formatearTelefono(lugar.numero_telefono)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTelefonoClick}
            className="inline-flex items-center text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors mb-2"
          >
            <span className="mr-1">💬</span>
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;