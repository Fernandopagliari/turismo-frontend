import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Seccion, SubSeccion, RegionZona } from '../types/tourism';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';
import Hero from '../components/home/Hero';
import PlacesGrid from '../components/home/PlacesGrid';
import { SearchBar } from '../components/places/SearchBar';
import PlaceDetail from '../components/places/PlaceDetail';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
    getSubSeccionesPorRegionZona,
    loading, 
    error, 
    buscarLugares 
  } = useApi();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<Seccion | null>(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<SubSeccion | null>(null);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<SubSeccion[] | null>(null);
  const [mostrarDestacados, setMostrarDestacados] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [regionZonaSeleccionada, setRegionZonaSeleccionada] = useState<number | null>(null); // NUEVO

  // Cambiar el título de la página dinámicamente
  useEffect(() => {
    if (configuracion && configuracion.titulo_app) {
      document.title = configuracion.titulo_app;
    }
  }, [configuracion]);

  // Resetear al cargar la página
  useEffect(() => {
    setSeccionActiva(null);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setResultadosBusqueda(null);
    setRegionZonaSeleccionada(null); // NUEVO
  }, []);

  // NUEVA FUNCIÓN: Manejar cambio de región/zona
  const handleRegionZonaChange = (regionZonaId: number | null) => {
    setRegionZonaSeleccionada(regionZonaId);
    setResultadosBusqueda(null);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
  };

  // NUEVA FUNCIÓN: Obtener lugares según la región/zona seleccionada
  const obtenerLugaresFiltrados = () => {
    if (resultadosBusqueda) {
      // Si hay resultados de búsqueda, filtrarlos por región/zona
      return resultadosBusqueda.filter(lugar => 
        !regionZonaSeleccionada || lugar.id_region_zona === regionZonaSeleccionada
      );
    } else if (mostrarDestacados) {
      // Si estamos en destacados, usar la función del hook con filtro
      return lugaresDestacados.filter(lugar => 
        !regionZonaSeleccionada || lugar.id_region_zona === regionZonaSeleccionada
      );
    } else if (seccionSeleccionada) {
      // Si hay una sección seleccionada, filtrar sus subsecciones
      return seccionSeleccionada.subsecciones.filter(lugar => 
        !regionZonaSeleccionada || lugar.id_region_zona === regionZonaSeleccionada
      );
    } else {
      // Estado inicial: mostrar todas las secciones filtradas por región/zona
      return getSeccionesPorRegionZona(regionZonaSeleccionada)
        .flatMap(seccion => seccion.subsecciones);
    }
  };

  // NUEVA FUNCIÓN: Obtener secciones filtradas por región/zona
  const obtenerSeccionesFiltradas = () => {
    return getSeccionesPorRegionZona(regionZonaSeleccionada);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!configuracion) return <LoadingSpinner />;

  const handleSearch = (termino: string) => {
    const resultados = buscarLugares(termino);
    setResultadosBusqueda(resultados);
    setMostrarDestacados(false);
    setSeccionSeleccionada(null);
    setSeccionActiva(null);
    setIsMenuOpen(false);
  };

  const handleClearSearch = () => {
    setResultadosBusqueda(null);
  };

  const handleHomeClick = () => {
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
    setResultadosBusqueda(null);
    setIsMenuOpen(false);
    setRegionZonaSeleccionada(null); // NUEVO: resetear región al hacer home
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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const seccionesFiltradas = obtenerSeccionesFiltradas();
  const lugaresFiltrados = obtenerLugaresFiltrados();
  const mostrarTodo = !seccionSeleccionada && !mostrarDestacados && !resultadosBusqueda;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header con selector de región/zona */}
      <Header 
        tituloApp={configuracion.titulo_app}
        logoApp={configuracion.logo_app_ruta_relativa}
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isMenuOpen}
        regionesZonas={regionesZonasHabilitadas} // NUEVO
        regionZonaSeleccionada={regionZonaSeleccionada} // NUEVO
        onRegionZonaChange={handleRegionZonaChange} // NUEVO
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isMenuOpen}
        secciones={seccionesHabilitadas}
        onSeccionClick={handleSeccionClick}
        onDestacadosClick={handleDestacadosClick}
        onHomeClick={handleHomeClick}
        lugaresDestacadosCount={lugaresDestacados.length}
        seccionActiva={seccionActiva}
      />

      {/* Contenido principal */}
      <main className={`flex-grow transition-all duration-300 ${isMenuOpen ? 'lg:ml-20' : ''}`}>  
        {/* Hero Section */}
        <section id="inicio" key={regionZonaSeleccionada || 'default'}>
          <Hero 
            titulo={heroTitulo} 
            subtitulo={configuracion.footer_texto}
            imagenFondo={heroImagen}
            regionZonaSeleccionada={
              regionZonaSeleccionada 
                ? regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada) 
                : null
            }
          />
        </section>

        {/* Barra de búsqueda */}
        <section className="container mx-auto px-4 py-8">
          <SearchBar 
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        </section>

        {/* Indicador de sección activa y región/zona */}
        {(seccionActiva || regionZonaSeleccionada) && (
          <div className="container mx-auto px-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-white text-sm">
                {regionZonaSeleccionada && (
                  <span className="font-semibold text-green-400 mr-4">
                    📍 Región: {regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada)?.nombre_region_zona}
                  </span>
                )}
                {seccionActiva && (
                  <span className="font-semibold text-blue-400">
                    {seccionActiva === 'destacados' ? '⭐ Lugares Destacados' : seccionActiva}
                  </span>
                )}
                <button 
                  onClick={handleHomeClick}
                  className="ml-4 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                >
                  Ver todo
                </button>
                {regionZonaSeleccionada && (
                  <button 
                    onClick={() => setRegionZonaSeleccionada(null)}
                    className="ml-2 text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                  >
                    Quitar filtro región
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Resultados de búsqueda */}
        {resultadosBusqueda ? (
          <PlacesGrid 
            lugares={lugaresFiltrados}
            titulo={`Resultados de búsqueda (${lugaresFiltrados.length})`}
            onPlaceClick={setLugarSeleccionado}
          />
        ) : (
          <>
            {/* Sección DESTACADOS */}
            {mostrarDestacados && lugaresFiltrados.length > 0 && (
              <section id="destacados" className="mb-12">
                <PlacesGrid 
                  lugares={lugaresFiltrados}
                  titulo="⭐ Lugares Destacados"
                  onPlaceClick={setLugarSeleccionado}
                  mostrarCategoria={true}
                />
              </section>
            )}

            {/* Sección específica seleccionada */}
            {seccionSeleccionada && lugaresFiltrados.length > 0 && (
              <section key={seccionSeleccionada.id_seccion} className="mb-12">
                <PlacesGrid 
                  lugares={lugaresFiltrados}
                  titulo={seccionSeleccionada.nombre_seccion}
                  onPlaceClick={setLugarSeleccionado}
                  mostrarCategoria={false}
                />
              </section>
            )}

            {/* Mostrar TODAS las secciones (solo en estado inicial) */}
            {mostrarTodo && seccionesFiltradas.map((seccion) => (
              seccion.subsecciones.length > 0 && (
                <section key={seccion.id_seccion} className="mb-12">
                  <PlacesGrid 
                    lugares={seccion.subsecciones}
                    titulo={seccion.nombre_seccion}
                    onPlaceClick={setLugarSeleccionado}
                    mostrarCategoria={false}
                  />
                </section>
              )
            ))}

            {/* Mensaje cuando no hay resultados */}
            {lugaresFiltrados.length === 0 && (
              <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                  <p className="text-gray-400 text-lg">
                    {regionZonaSeleccionada 
                      ? `No se encontraron lugares en la región seleccionada`
                      : 'No se encontraron lugares'
                    }
                  </p>
                  <button 
                    onClick={handleHomeClick}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Ver todos los lugares
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer configuracion={configuracion} />

      {/* Modal de detalle del lugar */}
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