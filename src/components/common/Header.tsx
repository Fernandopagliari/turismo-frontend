import React, { useState } from 'react';
// Importación alternativa - prueba esto
import type { RegionZona } from '../../types/tourism';

interface HeaderProps {
  tituloApp: string;
  logoApp: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  regionesZonas?: RegionZona[];
  regionZonaSeleccionada?: number | null;
  onRegionZonaChange?: (regionZonaId: number | null) => void;
}
const Header: React.FC<HeaderProps> = ({ 
  tituloApp, 
  logoApp, 
  onMenuToggle, 
  isMenuOpen,
  regionesZonas = [],
  regionZonaSeleccionada = null,
  onRegionZonaChange
}) => {
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);

  const handleRegionChange = (regionId: number | null) => {
    onRegionZonaChange?.(regionId);
    setIsRegionSelectorOpen(false);
  };

  const regionSeleccionada = regionesZonas.find(r => r.id_region_zona === regionZonaSeleccionada);

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* LADO IZQUIERDO: Menú + Logo + Título */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {/* Botón menú hamburguesa/cerrar */}
            <button 
              onClick={onMenuToggle}
              className="p-2 sm:p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logo y título */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              {logoApp && (
                <img 
                  src={logoApp} 
                  alt="Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-lg bg-white p-1 shadow-md border border-gray-600 flex-shrink-0"
                />
              )}
              <h1 className="text-base sm:text-lg font-semibold text-white truncate">
                {tituloApp}
              </h1>
            </div>
          </div>

          {/* CENTRO: Selector de Región/Zona - Responsive */}
          <div className="flex items-center justify-center mx-2 sm:mx-4 flex-1 max-w-md">
            {/* Versión Desktop/Tablet: Select normal */}
            <div className="hidden sm:block w-full max-w-xs">
              <div className="relative">
                <select
                  value={regionZonaSeleccionada || ''}
                  onChange={(e) => handleRegionChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-8 appearance-none cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <option value="">🌎 Todas las regiones</option>
                  {regionesZonas.map((region) => (
                    <option key={region.id_region_zona} value={region.id_region_zona}>
                      📍 {region.nombre_region_zona}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Versión Mobile: Botón compacto con dropdown */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setIsRegionSelectorOpen(!isRegionSelectorOpen)}
                className="flex items-center space-x-1 bg-gray-800 border border-gray-600 text-white text-xs rounded-lg p-2 hover:bg-gray-700 transition-colors min-w-[120px] justify-center"
              >
                <span className="truncate">
                  {regionSeleccionada ? `📍 ${regionSeleccionada.nombre_region_zona}` : '🌎 Región'}
                </span>
                <svg 
                  className={`w-3 h-3 transition-transform ${isRegionSelectorOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown para móvil */}
              {isRegionSelectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => handleRegionChange(null)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                      !regionZonaSeleccionada ? 'bg-blue-600 text-white' : 'text-gray-300'
                    }`}
                  >
                    🌎 Todas las regiones
                  </button>
                  {regionesZonas.map((region) => (
                    <button
                      key={region.id_region_zona}
                      onClick={() => handleRegionChange(region.id_region_zona)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors truncate ${
                        regionZonaSeleccionada === region.id_region_zona ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      📍 {region.nombre_region_zona}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LADO DERECHO: Espacio balanceado */}
          <div className="flex-1 min-w-0 flex justify-end">
            {/* Indicador de región seleccionada (solo móvil) */}
            {regionSeleccionada && (
              <div className="sm:hidden bg-blue-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                {regionSeleccionada.nombre_region_zona}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdown en móvil */}
      {isRegionSelectorOpen && (
        <div 
          className="fixed inset-0 z-30 sm:hidden"
          onClick={() => setIsRegionSelectorOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;