import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useApi } from "./hooks/useApi";
import Home from "./pages/Home";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./index.css";
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const { configuracion, loading, error } = useApi();

  // ✅ AGREGAR DIAGNÓSTICO
  console.log("🎯 App - Estado actual:");
  console.log("   loading:", loading);
  console.log("   configuracion:", configuracion);
  console.log("   error:", error);
  console.log("   habilitar:", configuracion?.habilitar);

  if (loading) {
    console.log("🔄 App: Mostrando LoadingSpinner");
    return <LoadingSpinner />;
  }

  if (error) {
    console.log("❌ App: Error detectado:", error);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error de conexión</h1>
          <p className="text-red-500 mb-2">{error}</p>
          <p>No se pudo cargar la configuración.</p>
        </div>
      </div>
    );
  }

  if (!configuracion || configuracion.habilitar !== 1) {
    console.log("⚠️ App: Configuración no disponible o deshabilitada");
    console.log("   Configuración completa:", configuracion);
    console.log("   Valor de habilitar:", configuracion?.habilitar);
    
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Aplicación no disponible</h1>
          <p>La aplicación está temporalmente deshabilitada.</p>
          {configuracion && (
            <p className="text-sm text-gray-500 mt-2">
              Estado: {configuracion.habilitar === 1 ? 'Habilitada' : 'Deshabilitada'}
            </p>
          )}
        </div>
      </div>
    );
  }

  console.log("✅ App: Configuración válida, renderizando Home");
  
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
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;