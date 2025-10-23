// PlaceDetail.tsx - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import { SubSeccion } from '../types/tourism';
import { useApi } from '../hooks/useApi';

interface PlaceDetailProps {
  lugar: SubSeccion | null;
  onClose: () => void;
  // ❌ ELIMINAR: onRegionFilter: (regionId: number) => void;
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ lugar, onClose }) => {
  const { getImageUrl } = useApi();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!lugar) return null;

  // Obtener todas las imágenes disponibles
  const imagenes = [
    lugar.imagen_ruta_relativa,
    lugar.foto1_ruta_relativa,
    lugar.foto2_ruta_relativa, 
    lugar.foto3_ruta_relativa,
    lugar.foto4_ruta_relativa
  ].filter(img => img && img.trim() !== '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{lugar.nombre_sub_seccion}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* ❌ ELIMINAR el botón de región si no se usa */}
          {lugar.destacado === 1 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              ⭐ Destacado
            </span>
          )}
        </div>

        {/* Galería de imágenes */}
        {imagenes.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={getImageUrl(imagenes[activeImageIndex])}
                alt={lugar.nombre_sub_seccion}
                className="w-full h-full object-cover"
              />
            </div>
            
            {imagenes.length > 1 && (
              <div className="flex space-x-2 mt-3 overflow-x-auto">
                {imagenes.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                      activeImageIndex === index ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img)}
                      alt={`${lugar.nombre_sub_seccion} ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Información del lugar */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📍 Dirección</h3>
            <p className="text-gray-700">{lugar.domicilio}</p>
          </div>

          {lugar.numero_telefono && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📞 Teléfono</h3>
              <p className="text-gray-700">{lugar.numero_telefono}</p>
            </div>
          )}

          {lugar.distancia > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🚗 Distancia</h3>
              <p className="text-gray-700">{lugar.distancia} km desde el centro</p>
            </div>
          )}

          {lugar.itinerario_maps && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🗺️ Cómo llegar</h3>
              <a 
                href={lugar.itinerario_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Ver en Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;