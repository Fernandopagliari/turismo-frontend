import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (termino: string) => void;   // 🟢 Cambiado: recibe texto
  onClear?: () => void;                  // 🔹 Opcional para limpiar búsqueda
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = "Buscar...",
}) => {
  const [termino, setTermino] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (termino.trim()) {
      onSearch(termino.trim());  // ✅ Enviamos el texto al padre
    }
  };

  const handleClear = () => {
    setTermino("");
    if (onClear) onClear(); // ✅ Limpia resultados en Home
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2 max-w-xl mx-auto"
    >
      <input
        type="text"
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        placeholder={placeholder}
        className="flex-1 outline-none text-gray-700"
      />
      {termino && (
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition"
      >
        Buscar
      </button>
    </form>
  );
};
