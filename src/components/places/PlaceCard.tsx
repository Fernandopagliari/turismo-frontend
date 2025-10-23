// PlaceCard.tsx - VERSIÓN CORREGIDA
import React from 'react';
import { SubSeccion } from '../../types/tourism';
import { useApi } from '../../hooks/useApi'; // ✅ Usar hook

interface PlaceCardProps {
  lugar: SubSeccion;
  onClick: (lugar: SubSeccion) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ lugar, onClick }) => {
  const { getImageUrl } = useApi(); // ✅ Usar del hook

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100"
      onClick={() => onClick(lugar)}
    >
      {/* Imagen del lugar */}
      <div className="relative h-48 bg-gray-200">
        <img 
          src={getImageUrl(lugar.imagen_ruta_relativa)} // ✅ Corregido
          alt={lugar.nombre_sub_seccion}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-4xl">🏛️</span>
        </div>

        {/* Badge destacado */}
        {lugar.destacado === 1 && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ Destacado
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {lugar.nombre_sub_seccion}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {lugar.domicilio}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span>📞</span>
            <span>{lugar.numero_telefono || 'Sin teléfono'}</span>
          </div>
          
          {lugar.distancia > 0 && (
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>{lugar.distancia} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;