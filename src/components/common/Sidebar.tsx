import React, { useState, useEffect } from 'react';
import { Seccion } from '../../types/tourism';

// ✅ Función para manejar rutas locales y remotas
const getImageUrl = (rutaRelativa: string) => {
  if (!rutaRelativa) return '';
  
  if (rutaRelativa.startsWith('http')) {
    return rutaRelativa;
  }
  
  const baseUrl = window.location.origin;

  if (rutaRelativa.startsWith('assets/') || rutaRelativa.startsWith('/assets/')) {
    return `${baseUrl}/static-assets/${rutaRelativa.replace(/^\/?assets\//, '')}`;
  }

  return `${baseUrl}/static-assets/${rutaRelativa}`;
};

interface SidebarProps {
  isOpen: boolean;
  secciones: Seccion[];
  onSeccionClick: (seccion: Seccion) => void;
  onDestacadosClick: () => void;
  onHomeClick: () => void;
  lugaresDestacadosCount: number;
  seccionActiva: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  secciones, 
  onSeccionClick, 
  onDestacadosClick,
  onHomeClick,
  lugaresDestacadosCount,
  seccionActiva 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:z-40">
      {/* Overlay para cerrar en móvil */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70 lg:bg-transparent" 
        onClick={onHomeClick}
      />
      
      <div className={`
        absolute left-0 top-0 h-full bg-gray-900 border-r border-gray-700 overflow-y-auto transition-all duration-300
        ${isMobile ? 'w-20' : 'w-16'}
      `}>
        <div className="py-4 flex flex-col items-center space-y-3">
          
          {/* Botón Home */}
          <button
            onClick={onHomeClick}
            className={`group relative w-12 h-12 p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
              !seccionActiva ? 'bg-blue-600 shadow-lg scale-110' : 'hover:bg-gray-800'
            }`}
            title="Inicio - Mostrar todo"
          >
            <span className="text-2xl">🏠</span>
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
              Inicio (Mostrar todo)
            </div>
          </button>

          {/* Botón Destacados */}
          <button
            onClick={onDestacadosClick}
            className={`group relative w-12 h-12 p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
              seccionActiva === 'destacados' ? 'bg-yellow-600 shadow-lg scale-110' : 'hover:bg-gray-800'
            }`}
            title="Lugares Destacados"
          >
            <div className="relative">
              <span className="text-2xl">⭐</span>
              {lugaresDestacadosCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {lugaresDestacadosCount}
                </span>
              )}
            </div>
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
              Destacados {lugaresDestacadosCount > 0 && `(${lugaresDestacadosCount})`}
            </div>
          </button>

          <div className="w-6 h-px bg-gray-700 my-2"></div>

          {/* Secciones */}
          {secciones.map((seccion) => (
            <button
              key={seccion.id_seccion}
              onClick={() => onSeccionClick(seccion)}
              className={`group relative w-12 h-12 p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                seccionActiva === seccion.nombre_seccion ? 'bg-blue-600 shadow-lg scale-110' : 'hover:bg-gray-800'
              }`}
              title={seccion.nombre_seccion}
            >
              {seccion.icono_seccion ? (
                <img 
                  src={getImageUrl(seccion.icono_seccion)}
                  alt={seccion.nombre_seccion}
                  className="w-6 h-6 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span className="text-2xl">🏛️</span>
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
                {seccion.nombre_seccion} ({seccion.subsecciones.length})
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
