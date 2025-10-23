// Header.tsx - VERSIÓN CORREGIDA CON PROPS ACTUALIZADAS
import React, { useState } from 'react';
import type { RegionZona } from '../../types/tourism';
import { useApi } from '../../hooks/useApi';

interface HeaderProps {
  tituloApp: string;
  logoApp: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  regionesZonas: RegionZona[];
  regionZonaSeleccionada: number | null;
  onRegionZonaChange: (regionZonaId: number | null) => void;
}

const Header: React.FC<HeaderProps> = ({
  tituloApp,
  logoApp,
  onMenuToggle,
  isMenuOpen,
  regionesZonas,
  regionZonaSeleccionada,
  onRegionZonaChange
}) => {
  const { getImageUrl } = useApi();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Encontrar la región seleccionada
  const regionSeleccionada = regionesZonas.find(
    region => region.id_region_zona === regionZonaSeleccionada
  ) || null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Abrir menú"
            >
              <span className="text-2xl">{isMenuOpen ? '✕' : '🍔'}</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src={getImageUrl(logoApp)}
                alt={`Logo ${tituloApp}`}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tituloApp}</h1>
                <p className="text-sm text-gray-600">Valle Fértil - San Juan</p>
              </div>
            </div>
          </div>

          {/* Selector de región - Desktop */}
          <div className="hidden lg:block relative">
            <select 
              value={regionZonaSeleccionada || ''}
              onChange={(e) => {
                const regionId = e.target.value ? parseInt(e.target.value) : null;
                onRegionZonaChange(regionId);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las regiones</option>
              {regionesZonas.map(region => (
                <option key={region.id_region_zona} value={region.id_region_zona}>
                  {region.nombre_region_zona}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <span className="text-lg">▼</span>
            </div>
          </div>

          {/* Selector de región - Mobile */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2"
            >
              <span className="text-lg">📍</span>
              <span className="text-sm font-medium">
                {regionSeleccionada ? regionSeleccionada.nombre_region_zona : 'Todas'}
              </span>
              <span className="text-lg">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => {
                    onRegionZonaChange(null);
                    setIsDropdownOpen(false);
                  }}
                >
                  Todas las regiones
                </div>
                {regionesZonas.map(region => (
                  <div
                    key={region.id_region_zona}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      onRegionZonaChange(region.id_region_zona);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {region.nombre_region_zona}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;