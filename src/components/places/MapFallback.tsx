// MapFallback.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapFallbackProps {
  latitud: number;
  longitud: number;
  nombre: string;
  domicilio?: string;
  height?: string;
}

const MapFallback: React.FC<MapFallbackProps> = ({ 
  latitud, 
  longitud, 
  nombre, 
  domicilio, 
  height = "400px" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configurar iconos de Leaflet una sola vez
  useEffect(() => {
    // Fix para los iconos de Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    // Verificar que tenemos un contenedor
    if (!mapRef.current) {
      setMapError('Contenedor del mapa no encontrado');
      setIsLoading(false);
      return;
    }

    // Validar coordenadas
    if (isNaN(latitud) || isNaN(longitud)) {
      setMapError(`Coordenadas inválidas: lat=${latitud}, lng=${longitud}`);
      setIsLoading(false);
      return;
    }

    console.log('Inicializando mapa con coordenadas:', { latitud, longitud });

    // Limpiar mapa anterior si existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    setIsLoading(true);

    try {
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        if (!mapRef.current) return;

        // Crear el mapa con opciones básicas COMPATIBLES
        const map = L.map(mapRef.current, {
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: false, // Deshabilitar zoom con rueda del mouse
          doubleClickZoom: true,  // Zoom con doble click
          boxZoom: true,          // Zoom con área seleccionada
          // tap: true, // ELIMINADO - no es una opción válida
        });

        // Establecer la vista
        map.setView([latitud, longitud], 15);
        mapInstanceRef.current = map;

        // Añadir capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 3,
        }).addTo(map);

        // Añadir marcador
        const marker = L.marker([latitud, longitud]).addTo(map);
        
        const popupContent = `
          <div style="padding: 8px; max-width: 250px;">
            <strong style="color: #333; font-size: 14px; display: block; margin-bottom: 4px;">${nombre}</strong>
            ${domicilio ? `<span style="color: #666; font-size: 12px;">${domicilio}</span>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent).openPopup();

        // Forzar redimensionamiento después de un delay
        const invalidateMapSize = () => {
          setTimeout(() => {
            try {
              map.invalidateSize();
              // Centrar el mapa después del redimensionamiento
              map.setView([latitud, longitud], map.getZoom());
            } catch (error) {
              console.warn('Error al redimensionar mapa:', error);
            }
          }, 150);
        };

        // Redimensionar inicialmente
        invalidateMapSize();

        // Event listeners para redimensionamiento
        const handleResize = () => invalidateMapSize();
        window.addEventListener('resize', handleResize);

        // Observer para cambios en el contenedor
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
              invalidateMapSize();
            }
          });
        });

        if (mapRef.current) {
          observer.observe(mapRef.current, { 
            attributes: true, 
            attributeFilter: ['class', 'style', 'width', 'height'] 
          });
        }

        setMapError(null);
        setIsLoading(false);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          observer.disconnect();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      }, 100);

    } catch (error) {
      console.error('Error crítico al crear el mapa:', error);
      setMapError(`Error al cargar el mapa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsLoading(false);
    }
  }, [latitud, longitud, nombre, domicilio]);

  // Efecto adicional para manejar la visibilidad del modal
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Redimensionar cuando el componente se monta (para modales)
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, []);

  if (mapError) {
    return (
      <div 
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-4">
          <div className="text-red-400 text-4xl mb-2">❌</div>
          <div className="text-gray-300">
            <div className="font-medium">Error cargando el mapa</div>
            <div className="text-sm text-gray-400 mt-1">{mapError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden relative"
      style={{ height }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Cargando mapa...
          </div>
        </div>
      )}
      
      {/* Mapa */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '200px'
        }}
        className="leaflet-map"
      />
      
      {/* Coordenadas debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
          {latitud.toFixed(4)}, {longitud.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default MapFallback;