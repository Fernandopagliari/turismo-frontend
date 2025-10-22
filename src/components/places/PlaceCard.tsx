import React from 'react';
import { SubSeccion } from '../../types/tourism';
import { getImageUrl } from '../../hooks/useApi';

interface PlaceCardProps {
  lugar: SubSeccion;
  onClick: (lugar: SubSeccion) => void;
  mostrarCategoria?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ lugar, onClick, mostrarCategoria = true }) => {
  const formatearTelefono = (telefono: string) => telefono.replace(/[\s\-\(\)]/g, '');
  const esTelefonoValido = (telefono: string) => /^\d{8,15}$/.test(formatearTelefono(telefono));
  const telefonoValido = lugar.numero_telefono && esTelefonoValido(lugar.numero_telefono);

  const handleTelefonoClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      className="bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 fade-in border border-gray-700"
      onClick={() => onClick(lugar)}
    >
      {/* Imagen */}
      <div className="h-48 overflow-hidden">
        <img 
          src={getImageUrl(lugar.imagen_ruta_relativa) || '/placeholder.jpg'}
          alt={lugar.nombre_sub_seccion}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
        />
      </div>

      <div className="p-4">
        {/* Nombre */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">{lugar.nombre_sub_seccion}</h3>
        {/* Domicilio */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-1">{lugar.domicilio}</p>
        
        {/* Teléfono */}
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

        {/* WhatsApp */}
        {telefonoValido && (
          <a 
            href={`https://wa.me/${formatearTelefono(lugar.numero_telefono)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTelefonoClick}
            className="inline-flex items-center text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors mb-2"
          >
            <span className="mr-1">💬</span> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
