import React, { useEffect, useState } from "react";
import { fetchImagenes, API_URL } from "../../api/api";

const Galeria: React.FC = () => {
  const [imagenes, setImagenes] = useState<string[]>([]);

  useEffect(() => {
    fetchImagenes()
      .then(data => setImagenes(data))
      .catch(err => console.error("Error cargando imágenes:", err));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {imagenes.length === 0 ? (
        <p>No hay imágenes para mostrar.</p>
      ) : (
        imagenes.map((img, index) => (
          <img
            key={index}
            src={`${API_URL}/${img}`}   // 👈 muy importante
            alt={`img-${index}`}
            className="w-full h-40 object-cover rounded-lg shadow"
          />
        ))
      )}
    </div>
  );
};

export default Galeria;
