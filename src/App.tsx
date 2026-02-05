import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useApi } from "./hooks/useApi";
import Home from "./pages/Home";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./index.css";
import "leaflet/dist/leaflet.css";

const App: React.FC = () => {
  const {
    configuracion,
    seccionesHabilitadas,
    lugaresDestacados,
    regionesZonasHabilitadas,
    getSeccionesPorRegionZona,
    buscarLugares,
    loading,
    error
  } = useApi();

  console.log("🎯 App - Estado actual:", {
    loading,
    configuracion,
    error
  });

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return <LoadingSpinner />;
  }

  /* =========================
     ERROR
     ========================= */
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">❌ Error de conexión</h1>
          <p className="text-red-400 mb-3">{error}</p>
          <p>No se pudo cargar la configuración.</p>
        </div>
      </div>
    );
  }

  /* =========================
     APP DESHABILITADA
     ========================= */
  if (!configuracion || configuracion.habilitar !== 1) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">🚫 Aplicación no disponible</h1>
          <p>La aplicación está temporalmente deshabilitada.</p>
        </div>
      </div>
    );
  }

  /* =========================
     APP OK
     ========================= */
  return (
    <Router>
      <div className="App font-sans">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                heroTitulo={configuracion.hero_titulo}
                heroImagen={configuracion.hero_imagen_ruta_relativa}
                configuracion={configuracion}
                seccionesHabilitadas={seccionesHabilitadas}
                lugaresDestacados={lugaresDestacados}
                regionesZonasHabilitadas={regionesZonasHabilitadas}
                getSeccionesPorRegionZona={getSeccionesPorRegionZona}
                buscarLugares={buscarLugares}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
