import React from 'react';
import { SubSeccion } from '../../types/tourism';
import PlaceCard from '../places/PlaceCard';

interface PlacesGridProps {
  lugares: SubSeccion[];
  titulo: string;
  onPlaceClick: (lugar: SubSeccion) => void;
  mostrarCategoria?: boolean;
}

const PlacesGrid: React.FC<PlacesGridProps> = ({ 
  lugares, 
  titulo, 
  onPlaceClick,
  mostrarCategoria = true 
}) => {
  // Filtrar solo lugares habilitados
  const lugaresHabilitados = lugares.filter(lugar => lugar.habilitar === 1);

  if (lugaresHabilitados.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-white">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {lugaresHabilitados.map((lugar) => (
          <PlaceCard 
            key={lugar.id_sub_seccion} 
            lugar={lugar} 
            onClick={onPlaceClick}
            mostrarCategoria={mostrarCategoria}
          />
        ))}
      </div>
    </div>
  );
};

export default PlacesGrid;
