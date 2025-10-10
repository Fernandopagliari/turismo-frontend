import React from 'react';
import { SubSeccion } from '../types/tourism';

interface PlacesListProps {
  subsecciones: SubSeccion[];
  titulo: string;
}

const PlacesList: React.FC<PlacesListProps> = ({ subsecciones, titulo }) => {
  // Filtrar solo subsecciones habilitadas
  const lugaresHabilitados = subsecciones.filter(sub => sub.habilitar);

  if (lugaresHabilitados.length === 0) {
    return (
      <div className="places-list">
        <h2>{titulo}</h2>
        <p>No hay lugares disponibles en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="places-list">
      <h2>{titulo} ({lugaresHabilitados.length})</h2>
      <div className="places-grid">
        {lugaresHabilitados.map((lugar) => (
          <div key={lugar.id_sub_seccion} className="place-card">
            <div className="place-image">
              <img 
                src={lugar.imagen_ruta_relativa || '/placeholder-image.jpg'} 
                alt={lugar.nombre_sub_seccion}
              />
            </div>
            <div className="place-info">
              <h3>{lugar.nombre_sub_seccion}</h3>
              <p className="address">{lugar.domicilio}</p>
              {lugar.distancia && (
                <p className="distance">{lugar.distancia} km del centro</p>
              )}
              {lugar.numero_telefono && (
                <p className="phone">📞 {lugar.numero_telefono}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacesList;