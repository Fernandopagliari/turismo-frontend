import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos
const createLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
};

interface MapProps {
  latitud: string | number;
  longitud: string | number;
  nombre: string;
  domicilio: string;
  height?: string;
}

const MapComponent: React.FC<MapProps> = ({ 
  latitud, 
  longitud, 
  nombre, 
  domicilio, 
  height = '300px' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    createLeafletIcon();

    const latNum = typeof latitud === 'string' ? parseFloat(latitud) : latitud;
    const lngNum = typeof longitud === 'string' ? parseFloat(longitud) : longitud;

    if (isNaN(latNum) || isNaN(lngNum)) return;

    // Crear mapa con Leaflet vanilla
    mapInstance.current = L.map(mapRef.current).setView([latNum, lngNum], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Agregar marcador
    L.marker([latNum, lngNum])
      .addTo(mapInstance.current)
      .bindPopup(`
        <div style="min-width: 200px">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: #1a202c">${nombre}</h3>
          <p style="color: #4a5568; font-size: 14px">${domicilio}</p>
        </div>
      `);

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [latitud, longitud, nombre, domicilio]);

  if (isNaN(typeof latitud === 'string' ? parseFloat(latitud) : latitud) || 
      isNaN(typeof longitud === 'string' ? parseFloat(longitud) : longitud)) {
    return (
      <div 
        className="bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700"
        style={{ height }}
      >
        <span className="text-gray-400">📍 Mapa no disponible</span>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800"
      style={{ height }}
    />
  );
};

export default MapComponent;