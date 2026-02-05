import React, { useState } from 'react';
import { Seccion } from '../../types/tourism';

interface SidebarProps {
  isOpen: boolean;
  secciones: Seccion[];
  onSeccionClick: (seccion: Seccion) => void;
  onDestacadosClick: () => void;
  onHomeClick: () => void;
  lugaresDestacadosCount: number;
  seccionActiva: string | null;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
  visible: boolean;
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
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onHomeClick}
      />

      {/* Sidebar */}
      <aside
        className={`absolute left-0 top-0 h-full bg-gray-900 border-r border-gray-700
        flex flex-col py-4 transition-all duration-300
        ${isCollapsed ? 'w-20 items-center' : 'w-56 px-3'}
        overflow-y-auto`}
      >
        {/* TOGGLE */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-4 text-gray-400 hover:text-white transition"
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>

        {/* HOME */}
        <SidebarButton
          active={!seccionActiva}
          icon="🏠"
          label="Inicio"
          collapsed={isCollapsed}
          onClick={onHomeClick}
          setTooltip={setTooltip}
        />

        {/* DESTACADOS */}
        <SidebarButton
          active={seccionActiva === 'destacados'}
          icon="⭐"
          label="Destacados"
          collapsed={isCollapsed}
          onClick={onDestacadosClick}
          setTooltip={setTooltip}
        >
          {lugaresDestacadosCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {lugaresDestacadosCount}
            </span>
          )}
        </SidebarButton>

        <div className="w-full h-px bg-gray-700 my-3" />

        {/* SECCIONES */}
        {secciones.map(seccion => (
          <SidebarButton
            key={seccion.id_seccion}
            active={seccionActiva === seccion.nombre_seccion}
            label={seccion.nombre_seccion}
            collapsed={isCollapsed}
            onClick={() => onSeccionClick(seccion)}
            setTooltip={setTooltip}
          >
            {seccion.icono_seccion ? (
              <img
                src={seccion.icono_seccion}
                alt={seccion.nombre_seccion}
                className="w-7 h-7 object-contain"
              />
            ) : (
              <span className="text-xl">📍</span>
            )}
          </SidebarButton>
        ))}
      </aside>

      {/* TOOLTIP SUAVE */}
      {tooltip && (
        <div
          className={`fixed z-50 pointer-events-none
          bg-black text-white text-xs px-2 py-1 rounded
          transition-all duration-300 ease-out
          ${tooltip.visible
            ? 'opacity-100 translate-x-2'
            : 'opacity-0 translate-x-0'}
          `}
          style={{
            top: tooltip.y,
            left: tooltip.x
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

/* =========================
   BOTÓN REUTILIZABLE
========================= */

interface SidebarButtonProps {
  icon?: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>;
  children?: React.ReactNode;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  active,
  collapsed,
  onClick,
  setTooltip,
  children
}) => (
  <button
    onClick={onClick}
    onMouseEnter={e =>
      setTooltip({
        text: label,
        x: e.clientX + 14,
        y: e.clientY,
        visible: true
      })
    }
    onMouseLeave={() =>
      setTooltip(prev => (prev ? { ...prev, visible: false } : null))
    }
    className={`
      relative flex items-center rounded-lg transition
      ${collapsed
        ? 'w-12 h-12 justify-center'
        : 'w-full px-3 py-2 justify-start'}
      ${active ? 'bg-blue-600 scale-[1.03]' : 'hover:bg-gray-800'}
    `}
  >
    {/* ICONO (NUNCA SE COLAPSA) */}
    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
      {icon ? (
        <span className="text-xl">{icon}</span>
      ) : (
        children
      )}
    </div>

    {/* TEXTO */}
    {!collapsed && (
      <span
        className="
          text-sm text-white whitespace-nowrap overflow-hidden text-ellipsis
        "
      >
        {label}
      </span>
    )}
  </button>
);

