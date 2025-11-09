// Sidebar.tsx - VERSIÓN COMPLETA CON CACHE PARA ÍCONOS DE SECCIÓN
import React, { useState, useEffect } from 'react';
import { Seccion } from '../../types/tourism';
import { useApi } from '../../hooks/useApi';
import { useImageCache } from '../../hooks/useImageCache';

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
  const { getImageUrl } = useApi();
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

          {/* Secciones con cache optimizado para cada ícono */}
          {secciones.map((seccion) => (
            <SidebarSectionItem 
              key={seccion.id_seccion}
              seccion={seccion}
              isActive={seccionActiva === seccion.nombre_seccion}
              onSeccionClick={onSeccionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente interno para manejar el cache de íconos individuales
interface SidebarSectionItemProps {
  seccion: Seccion;
  isActive: boolean;
  onSeccionClick: (seccion: Seccion) => void;
}

const SidebarSectionItem: React.FC<SidebarSectionItemProps> = ({ 
  seccion, 
  isActive, 
  onSeccionClick 
}) => {
  const { getImageUrl } = useApi();
  
  // ✅ CACHE OPTIMIZADO para cada ícono individual
  const { 
    cachedUrl: iconUrl, 
    loading: iconLoading, 
    error: iconError 
  } = useImageCache(seccion.icono_seccion, {
    timeout: 5000,
    retries: 1
  });

  const handleClick = () => {
    onSeccionClick(seccion);
  };

  // URL final con fallback a la URL directa si el cache falla
  const finalIconUrl = iconUrl || getImageUrl(seccion.icono_seccion);

  // DEBUG: Verificar carga de íconos
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Sidebar - Ícono ${seccion.nombre_seccion}:`, {
        iconoSeccion: seccion.icono_seccion,
        iconUrl,
        iconLoading,
        iconError,
        finalIconUrl
      });
    }
  }, [seccion.nombre_seccion, seccion.icono_seccion, iconUrl, iconLoading, iconError, finalIconUrl]);

  return (
    <button
      onClick={handleClick}
      className={`group relative w-12 h-12 p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
        isActive ? 'bg-blue-600 shadow-lg scale-110' : 'hover:bg-gray-800'
      } ${iconLoading ? 'opacity-50' : ''}`}
      title={seccion.nombre_seccion}
      disabled={iconLoading}
    >
      {/* Loading state - spinner mientras carga el ícono */}
      {iconLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Ícono de la sección con manejo de errores */}
      {seccion.icono_seccion ? (
        <img 
          src={finalIconUrl}
          alt={seccion.nombre_seccion}
          className={`w-6 h-6 object-contain transition-all duration-300 ${
            iconLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          } ${isActive ? 'brightness-0 invert' : ''}`}
          onLoad={() => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Sidebar - Ícono cargado: ${seccion.nombre_seccion}`);
            }
          }}
          onError={(e) => { 
            console.error(`❌ Sidebar - Error cargando ícono: ${seccion.icono_seccion}`);
            // Ocultar imagen y permitir que se muestre el fallback
            e.currentTarget.style.display = 'none';
          }}
          loading="lazy"
          decoding="async"
        />
      ) : (
        // Fallback si no hay ícono definido
        <span className={`text-2xl transition-opacity duration-200 ${
          iconLoading ? 'opacity-0' : 'opacity-100'
        }`}>
          📍
        </span>
      )}

      {/* Fallback visual si hay error de carga */}
      {seccion.icono_seccion && iconError && !iconLoading && (
        <span className="text-2xl absolute opacity-80">📍</span>
      )}

      {/* Tooltip informativo */}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
        <div className="font-semibold">{seccion.nombre_seccion}</div>
        <div className="text-gray-300">{seccion.subsecciones.length} lugares</div>
        {iconLoading && (
          <div className="text-yellow-400 text-[10px] mt-1">Cargando ícono...</div>
        )}
        {iconError && (
          <div className="text-red-400 text-[10px] mt-1">Error cargando ícono</div>
        )}
      </div>

      {/* Indicador de estado de carga (solo desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
          iconLoading ? 'bg-yellow-500 animate-pulse' : 
          iconError ? 'bg-red-500' : 
          'bg-green-500'
        }`}></div>
      )}
    </button>
  );
};

export default Sidebar;