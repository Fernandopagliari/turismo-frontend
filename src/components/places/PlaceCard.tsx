import React, { useState } from 'react';
import { SubSeccion } from '../../types/tourism';
import { useImageCache } from '../../hooks/useImageCache';
import { highlightText } from '../../utils/highlightText';
import { useApi } from '../../hooks/useApi';

interface PlaceCardProps {
  lugar: SubSeccion;
  onClick: (lugar: SubSeccion) => void;
  mostrarCategoria?: boolean;
  terminoBusqueda?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  lugar,
  onClick,
  mostrarCategoria = true,
  terminoBusqueda
}) => {

  /* =========================
     API
  ========================= */
  const { darLike } = useApi();

  /* =========================
     IMAGEN CON CACHE
  ========================= */
  const { cachedUrl, loading: imageLoading } = useImageCache(
    lugar.imagen_ruta_relativa
  );

  /* =========================
     TELÉFONO
  ========================= */
  const formatearTelefono = (telefono: string): string =>
    telefono.replace(/[\s\-\(\)]/g, '');

  const esTelefonoValido = (telefono: string): boolean => {
    const limpio = formatearTelefono(telefono);
    return /^\d{8,15}$/.test(limpio);
  };

  const telefonoValido =
    !!lugar.numero_telefono && esTelefonoValido(lugar.numero_telefono);

  const handleTelefonoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /* =========================
     LIKES
  ========================= */
  const [likes, setLikes] = useState(lugar.likes || 0);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (liking || liked) return;

    setLiking(true);

    try {
      const nuevoTotal = await darLike(lugar.id_sub_seccion);
      setLikes(nuevoTotal);
      setLiked(true);
    } catch (err) {
      console.error("Error like:", err);
    } finally {
      setLiking(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div
      className="
        bg-gray-800 rounded-lg shadow-md overflow-hidden
        cursor-pointer border border-gray-700
        hover:shadow-xl transition-all duration-300
      "
      onClick={() => onClick(lugar)}
    >

      {/* ================= IMAGEN ================= */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={cachedUrl || '/placeholder.jpg'}
          alt={lugar.nombre_sub_seccion}
          className={`
            w-full h-full object-cover
            transition-transform duration-300
            hover:scale-105
            ${imageLoading ? 'opacity-50' : 'opacity-100'}
          `}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==';
          }}
        />

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}
      </div>

      {/* ================= INFO ================= */}
      <div className="p-4 space-y-2">

        {/* Nombre */}
        <h3 className="font-semibold text-lg text-white line-clamp-2">
          {highlightText(
            lugar.nombre_sub_seccion,
            terminoBusqueda ?? ''
          )}
        </h3>

        {/* Dirección */}
        {lugar.domicilio && (
          <p className="text-gray-300 text-sm line-clamp-1">
            {highlightText(
              lugar.domicilio,
              terminoBusqueda ?? ''
            )}
          </p>
        )}

        {/* Teléfono */}
        {telefonoValido && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-green-400">📞 Teléfono</span>
            <a
              href={`tel:${formatearTelefono(lugar.numero_telefono!)}`}
              onClick={handleTelefonoClick}
              className="
                text-green-300 hover:text-green-200
                font-mono bg-green-900/30
                px-2 py-1 rounded
              "
            >
              {lugar.numero_telefono}
            </a>
          </div>
        )}

        {/* WhatsApp */}
        {telefonoValido && (
          <a
            href={`https://wa.me/${formatearTelefono(lugar.numero_telefono!)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTelefonoClick}
            className="
              inline-flex items-center gap-1
              text-xs bg-green-600 hover:bg-green-700
              text-white px-3 py-1 rounded-full
              transition-colors
            "
          >
            💬 WhatsApp
          </a>
        )}

        {/* Likes */}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleLike}
            disabled={liking || liked}
            className={`
              flex items-center gap-2
              text-white text-xs
              px-3 py-1 rounded-full
              transition
              disabled:opacity-50
              ${liked
                ? "bg-green-600"
                : "bg-blue-600/80 hover:bg-blue-600"}
            `}
          >
            👍 Me gusta
            <span className="font-bold transition-transform duration-200 hover:scale-125">
              {likes}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlaceCard;
