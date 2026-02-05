import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Seccion, SubSeccion } from '../types/tourism';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';
import Hero from '../components/home/Hero';
import PlacesGrid from '../components/home/PlacesGrid';
import SearchBar from '../components/home/SearchBarLegacy';
import PlaceDetail from '../components/places/PlaceDetail';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* =========================
   API BASE (VITE)
========================= */
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  `${window.location.origin}/api`;


interface HomeProps {
  heroTitulo: string;
  heroImagen: string;
}

const Home: React.FC<HomeProps> = ({ heroTitulo, heroImagen }) => {
  const {
    configuracion,
    seccionesHabilitadas,
    lugaresDestacados,
    regionesZonasHabilitadas,
    getSeccionesPorRegionZona,
    loading,
    error
  } = useApi();

  /* =========================
     DETECCIÓN MOBILE
  ========================= */
  const isMobile = window.innerWidth < 768;

  /* =========================
     ESTADOS UI
  ========================= */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<Seccion | null>(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<SubSeccion | null>(null);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<SubSeccion[]>([]);
  const [mostrarDestacados, setMostrarDestacados] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [regionZonaSeleccionada, setRegionZonaSeleccionada] = useState<number | null>(null);

  /* =========================
     EFECTOS
  ========================= */
  useEffect(() => {
    if (configuracion?.titulo_app) {
      document.title = configuracion.titulo_app;
    }
  }, [configuracion]);

  useEffect(() => {
    resetearEstado();
  }, []);

  /* =========================
     🔥 VISITA APP (1 VEZ)
  ========================= */
  useEffect(() => {
    fetch(`${API_BASE}/visita-app`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {
      // silencioso: no rompe UI si falla
    });
  }, []);

  /* =========================
     RESET GENERAL
  ========================= */
  const resetearEstado = () => {
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setResultadosBusqueda([]);
    setSeccionActiva(null);
    setRegionZonaSeleccionada(null);
  };

  /* =========================
     FILTROS
  ========================= */
  const obtenerSeccionesFiltradas = () =>
    getSeccionesPorRegionZona(regionZonaSeleccionada);

  const obtenerLugaresFiltrados = (): SubSeccion[] => {
    if (resultadosBusqueda.length > 0) {
      return resultadosBusqueda.filter(
        l => !regionZonaSeleccionada || l.id_region_zona === regionZonaSeleccionada
      );
    }

    if (mostrarDestacados) {
      return lugaresDestacados.filter(
        l => !regionZonaSeleccionada || l.id_region_zona === regionZonaSeleccionada
      );
    }

    if (seccionSeleccionada) {
      return seccionSeleccionada.subsecciones.filter(
        l => !regionZonaSeleccionada || l.id_region_zona === regionZonaSeleccionada
      );
    }

    return obtenerSeccionesFiltradas().flatMap(s => s.subsecciones);
  };

  /* =========================
     HANDLERS
  ========================= */
  const handleRegionZonaChange = (id: number | null) => {
    setRegionZonaSeleccionada(id);
    setResultadosBusqueda([]);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
  };

  const handleSearch = (resultados: SubSeccion[]) => {
    setResultadosBusqueda(resultados);
    setMostrarDestacados(false);
    setSeccionSeleccionada(null);
    setSeccionActiva(null);
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    resetearEstado();
    setIsMenuOpen(false);
  };

  const handleSeccionClick = (seccion: Seccion) => {
    setSeccionSeleccionada(seccion);
    setMostrarDestacados(false);
    setSeccionActiva(seccion.nombre_seccion);
    setIsMenuOpen(false);
  };

  const handleDestacadosClick = () => {
    setMostrarDestacados(true);
    setSeccionSeleccionada(null);
    setSeccionActiva('destacados');
    setIsMenuOpen(false);
  };

  /* =========================
     ESTADOS GLOBALES
  ========================= */
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!configuracion) return <LoadingSpinner />;

  const lugaresFiltrados = obtenerLugaresFiltrados();
  const seccionesFiltradas = obtenerSeccionesFiltradas();

  const mostrarTodo =
    !seccionSeleccionada &&
    !mostrarDestacados &&
    resultadosBusqueda.length === 0;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header
        tituloApp={configuracion.titulo_app}
        logoApp={configuracion.logo_app_ruta_relativa}
        onMenuToggle={() => setIsMenuOpen(prev => !prev)}
        isMenuOpen={isMenuOpen}
        regionesZonas={regionesZonasHabilitadas}
        regionZonaSeleccionada={regionZonaSeleccionada}
        onRegionZonaChange={handleRegionZonaChange}
      />

      <Sidebar
        isOpen={isMenuOpen}
        secciones={seccionesHabilitadas}
        onSeccionClick={handleSeccionClick}
        onDestacadosClick={handleDestacadosClick}
        onHomeClick={handleHomeClick}
        lugaresDestacadosCount={lugaresDestacados.length}
        seccionActiva={seccionActiva}
      />

      <main className={`flex-grow transition-all duration-300 ${isMenuOpen ? 'lg:ml-20' : ''}`}>
        <Hero
          titulo={heroTitulo}
          subtitulo={configuracion.footer_texto}
          imagenFondo={heroImagen}
          regionZonaSeleccionada={
            regionZonaSeleccionada
              ? regionesZonasHabilitadas.find(
                  r => r.id_region_zona === regionZonaSeleccionada
                ) ?? null
              : null
          }
        />

        <section className="container mx-auto px-4 py-8 relative z-10">
          <SearchBar
            onSearch={handleSearch}
            onClear={() => setResultadosBusqueda([])}
            disableOverlay={isMobile}
          />
        </section>

        {mostrarTodo &&
          seccionesFiltradas.map(
            s =>
              s.subsecciones.length > 0 && (
                <section key={s.id_seccion} className="mb-12">
                  <PlacesGrid
                    lugares={s.subsecciones}
                    titulo={s.nombre_seccion}
                    onPlaceClick={setLugarSeleccionado}
                  />
                </section>
              )
          )}

        {!mostrarTodo && (
          <PlacesGrid
            lugares={lugaresFiltrados}
            titulo={
              seccionActiva === 'destacados'
                ? '⭐ Lugares Destacados'
                : seccionSeleccionada?.nombre_seccion || 'Resultados'
            }
            onPlaceClick={setLugarSeleccionado}
            mostrarCategoria={mostrarDestacados}
          />
        )}
      </main>

      <Footer configuracion={configuracion} />

      {lugarSeleccionado && (
        <PlaceDetail
          lugar={lugarSeleccionado}
          onClose={() => setLugarSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default Home;
