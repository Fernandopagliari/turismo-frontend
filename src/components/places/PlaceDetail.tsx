import React from 'react';
import { SubSeccion } from '../../types/tourism';
import ImageGallery from './ImageGallery';
import MapFallback from './MapFallback';
import { useGeolocation } from '../../hooks/useGeolocation';

interface PlaceDetailProps {
  lugar: SubSeccion;
  onClose: () => void;
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ lugar, onClose }) => {
  const { position, calcularDistancia } = useGeolocation();

  // Función para validar coordenadas
  const validarCoordenadas = (lat: string | number, lng: string | number): boolean => {
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
    return !isNaN(latNum) && !isNaN(lngNum) && 
           latNum >= -90 && latNum <= 90 && 
           lngNum >= -180 && lngNum <= 180;
  };

  // Función para parsear coordenadas
  const parsearCoordenadas = (lat: string | number, lng: string | number): [number, number] | null => {
    if (!validarCoordenadas(lat, lng)) return null;
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
    return [latNum, lngNum];
  };

  // Función para formatear número de teléfono
  const formatearTelefono = (telefono: string): string => {
    return telefono.replace(/[\s\-\(\)]/g, '');
  };

  // Función para generar link de WhatsApp
  const generarLinkWhatsApp = (telefono: string, mensaje?: string): string => {
    const numeroLimpio = formatearTelefono(telefono);
    const texto = mensaje || `Hola, me interesa obtener información sobre ${lugar.nombre_sub_seccion}`;
    const textoCodificado = encodeURIComponent(texto);
    return `https://wa.me/${numeroLimpio}?text=${textoCodificado}`;
  };

  // Función para validar si es un número de teléfono válido
  const esTelefonoValido = (telefono: string): boolean => {
    const numeroLimpio = formatearTelefono(telefono);
    return /^\d{8,15}$/.test(numeroLimpio);
  };

  // Recolectar todas las imágenes y videos disponibles
  const todosLosMedios = [
    lugar.imagen_ruta_relativa,
    lugar.foto1_ruta_relativa,
    lugar.foto2_ruta_relativa,
    lugar.foto3_ruta_relativa,
    lugar.foto4_ruta_relativa
  ].filter(medio => medio && !medio.includes('null'));

  // Calcular distancia solo si las coordenadas son válidas
  let distanciaCalculada: number | null = null;
  const coordenadasLugar = parsearCoordenadas(lugar.latitud, lugar.longitud);
  
  if (position && coordenadasLugar) {
    distanciaCalculada = calcularDistancia(
      position.latitude,
      position.longitude,
      coordenadasLugar[0],
      coordenadasLugar[1]
    );
  }

  const telefonoValido = lugar.numero_telefono && esTelefonoValido(lugar.numero_telefono);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 lg:p-4">
      <div className="bg-gray-900 rounded-lg w-full h-full max-w-6xl max-h-[95dvh] lg:max-h-[90vh] overflow-y-auto modal-scroll border border-gray-700">
        <div className="p-4 lg:p-6">
          {/* Header responsive */}
          <div className="flex justify-between items-start mb-4 lg:mb-6">
            <div className="flex-1 mr-3">
              <h2 className="text-xl lg:text-3xl font-bold text-white mb-1 lg:mb-2 leading-tight">
                {lugar.nombre_sub_seccion}
              </h2>
              <p className="text-gray-300 text-sm lg:text-base truncate">
                {lugar.domicilio}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl p-3 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Grid responsive - una columna en móvil, dos en desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            
            {/* Columna izquierda - Galería e información */}
            <div className="space-y-4 lg:space-y-6">
              {/* Galería de imágenes y videos */}
              <div className="bg-gray-800 rounded-lg p-3 lg:p-4 border border-gray-700">
                <ImageGallery imagenes={todosLosMedios} titulo={lugar.nombre_sub_seccion} />
              </div>

              {/* Información del lugar */}
              <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-white">
                  Información
                </h3>
                
                <div className="space-y-3 lg:space-y-4">
                  {distanciaCalculada && (
                    <div className="flex items-center bg-gray-700 rounded-lg p-3">
                      <span className="text-blue-400 text-lg mr-3">📍</span>
                      <div>
                        <span className="text-white block">Distancia desde tu ubicación</span>
                        <span className="text-blue-300 font-semibold">{distanciaCalculada} km</span>
                      </div>
                    </div>
                  )}

                  {/* Sección de contacto */}
                  {telefonoValido && (
                    <div className="space-y-3">
                      <h4 className="text-md lg:text-lg font-medium text-white mb-2">📞 Contacto</h4>
                      
                      {/* Llamada telefónica */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-gray-700 rounded-lg p-3 space-y-2 sm:space-y-0">
                        <div className="flex items-center">
                          <span className="text-green-400 text-xl mr-3">📞</span>
                          <span className="text-white font-mono text-sm lg:text-base">
                            {lugar.numero_telefono}
                          </span>
                        </div>
                        <a 
                          href={`tel:${formatearTelefono(lugar.numero_telefono)}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center min-h-[44px]"
                        >
                          <span className="mr-2">Llamar</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/>
                          </svg>
                        </a>
                      </div>

                      {/* WhatsApp */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-gray-700 rounded-lg p-3 space-y-2 sm:space-y-0">
                        <div className="flex items-center">
                          <span className="text-green-400 text-xl mr-3">💬</span>
                          <span className="text-white">WhatsApp</span>
                        </div>
                        <a 
                          href={generarLinkWhatsApp(lugar.numero_telefono)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center min-h-[44px]"
                        >
                          <span className="mr-2">Enviar mensaje</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm5.44 13.34c-.25.73-1.27 1.34-1.79 1.34-.52 0-1.05-.25-3.62-1.36-2.57-1.11-4.17-3.78-4.29-3.95-.12-.17-.97-1.38-.97-2.61 0-1.23.62-1.84.85-2.07.23-.23.52-.3.68-.3h.57c.17 0 .4.07.68.3.23.23.75.75.9 1.07.15.32.3.8.03 1.27-.27.47-1.07 1.07-1.3 1.14-.23.07-.46.1-.63.1-.17 0-.34-.03-.5-.1-.17-.07-1.03-.38-1.97-1.21-1.73-1.54-2.09-3.18-2.17-3.57-.08-.39.02-.75.3-1.01.3-.3.75-.38 1.01-.38h.57c.17 0 .4.07.68.3.23.23.75.75.9 1.07.15.32.3.8.03 1.27-.27.47-.4.75-.4.75s.17.35.5.6c.33.25.6.4.9.55.3.15.6.25.9.35.3.1.6.15.9.15.3 0 .6-.05.9-.15.3-.1.6-.2.9-.35.3-.15.6-.3.9-.55.33-.25.5-.6.5-.6s-.13-.28-.4-.75c-.27-.47-.12-.95.03-1.27.15-.32.67-.84.9-1.07.28-.23.51-.3.68-.3h.57c.26 0 .71.08 1.01.38.28.26.38.62.3 1.01-.08.39-.44 2.03-2.17 3.57z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}

                  {lugar.itinerario_maps && (
                    <div className="bg-gray-700 rounded-lg p-3">
                      <span className="text-blue-400 font-medium block mb-2">🗺️ Descripción:</span>
                      <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                        {lugar.itinerario_maps}
                      </p>
                    </div>
                  )}

                  {/* Indicador de videos */}
                  {todosLosMedios.some(medio => medio.toLowerCase().endsWith('.mp4')) && (
                    <div className="flex items-center p-3 bg-blue-900 bg-opacity-30 rounded-lg">
                      <span className="text-blue-400 mr-2">🎬</span>
                      <span className="text-blue-300 text-sm">Este lugar incluye videos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Google Maps */}
              {coordenadasLugar && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${coordenadasLugar[0]},${coordenadasLugar[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center block flex items-center justify-center min-h-[44px]"
                >
                  <span className="mr-2">🗺️</span>
                  Abrir en Google Maps
                </a>
              )}
            </div>

            {/* Columna derecha - Mapa e información adicional */}
            <div className="space-y-4 lg:space-y-6">
              {/* Mapa */}
              <div className="space-y-6">
                {coordenadasLugar ? (
                  <MapFallback
                    latitud={coordenadasLugar[0]}
                    longitud={coordenadasLugar[1]}
                    nombre={lugar.nombre_sub_seccion}
                    domicilio={lugar.domicilio}
                    height="400px"
                  />
                ) : (
                  <div className="bg-gray-800 h-64 rounded-lg flex items-center justify-center border border-gray-700 flex-col">
                    <span className="text-gray-400 mb-2">📍 Mapa no disponible</span>
                    <span className="text-gray-500 text-sm">
                      {!lugar.latitud || !lugar.longitud 
                        ? "Coordenadas no proporcionadas" 
                        : "Coordenadas inválidas"
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Consejos de contacto */}
              {telefonoValido && (
                <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-2 flex items-center">
                    <span className="mr-2">💬</span>
                    Consejos de contacto
                  </h4>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• Usa WhatsApp para consultas rápidas</li>
                    <li>• Llama para reservas o información detallada</li>
                    <li>• Horario recomendado: 9:00 - 20:00 hs</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;