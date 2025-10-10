import React, { useState } from 'react';
import { SubSeccion } from '../../types/tourism';

interface SearchBarProps {
  onSearch: (resultados: SubSeccion[]) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onClear, 
  placeholder = "Buscar lugares turísticos..." 
}) => {
  const [termino, setTermino] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termino.trim()) {
      onClear();
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/secciones`);
      const secciones = await response.json();
      
      const resultados = secciones.flatMap((seccion: any) => 
        seccion.subsecciones.filter((sub: SubSeccion) => 
          sub.habilitar === 1 && 
          sub.nombre_sub_seccion.toLowerCase().includes(termino.toLowerCase())
        )
      );

      onSearch(resultados);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={termino}
          onChange={(e) => {
            setTermino(e.target.value);
            if (!e.target.value.trim()) onClear();
          }}
          placeholder={placeholder}
          className="w-full px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;