import React, { useEffect, useState } from 'react';
import { SubSeccion } from '../../types/tourism';
import { useApi } from '../../hooks/useApi';

interface SearchBarProps {
  onSearch: (resultados: SubSeccion[]) => void;
  onClear: () => void;
  placeholder?: string;
  disableOverlay?: boolean; // 👈 NUEVO
}

const SearchBarLegacy: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Buscar lugares...',
  disableOverlay = false
}) => {
  const { seccionesHabilitadas } = useApi();

  const [texto, setTexto] = useState('');

  const isMobile = window.innerWidth < 768;

  /* =========================
     TODAS LAS SUBSECCIONES
  ========================= */
  const todasLasSubsecciones: SubSeccion[] =
    seccionesHabilitadas.flatMap(s => s.subsecciones || []);

  /* =========================
     DEBOUNCE SEARCH
  ========================= */
  useEffect(() => {
    const handler = setTimeout(() => {
      const termino = texto.trim().toLowerCase();

      if (!termino) {
        onClear();
        return;
      }

      const resultados = todasLasSubsecciones.filter(lugar =>
        lugar.nombre_sub_seccion.toLowerCase().includes(termino)
      );

      onSearch(resultados);
    }, 300);

    return () => clearTimeout(handler);
  }, [texto, todasLasSubsecciones, onSearch, onClear]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="relative max-w-xl mx-auto">
      <input
        type="text"
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-4 py-3 rounded-lg
          bg-gray-800 text-white
          placeholder-gray-400
          border border-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition
        "
      />

      {texto && (
        <button
          onClick={() => {
            setTexto('');
            onClear();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBarLegacy;
