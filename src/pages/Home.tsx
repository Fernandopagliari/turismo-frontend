// Home.tsx - VERSIÓN COMPLETA CORREGIDA
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Seccion, SubSeccion, RegionZona } from '../types/tourism';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';
import Hero from '../components/places/Hero';
import PlacesGrid from '../components/places/PlacesGrid'; 
import { SearchBar } from '../components/places/SearchBar';
import PlaceDetail from '../components/places/PlaceDetail';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getImageUrl } from '../hooks/useApi';
import { useImageCache } from '../hooks/useImageCache';

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
    buscarLugares,
    loading, 
    error
  } = useApi();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<Seccion | null>(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<SubSeccion | null>(null);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<SubSeccion[] | null>(null);
  const [mostrarDestacados, setMostrarDestacados] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [regionZonaSeleccionada, setRegionZonaSeleccionada] = useState<number | null>(null);
  
  // Estado: Imagen actual del Hero
  const [heroImagenActual, setHeroImagenActual] = useState<string>(heroImagen);
  const [heroTituloActual, setHeroTituloActual] = useState<string>(heroTitulo);

  // ✅ CACHE PARA IMÁGENES PRINCIPALES
  const { cachedUrl: heroImageUrl } = useImageCache(heroImagenActual);
  const { cachedUrl: logoUrl } = useImageCache(configuracion?.logo_app_ruta_relativa);

  // DEBUG: Verificar imágenes
  useEffect(() => {
    console.log('🔍 Home - DEBUG IMÁGENES:');
    console.log('heroImagen (prop):', heroImagen);
    console.log('heroImagenActual (estado):', heroImagenActual);
    console.log('heroImageUrl (cache):', heroImageUrl);
    console.log('getImageUrl result:', getImageUrl(heroImagenActual));
  }, [heroImagen, heroImagenActual, heroImageUrl]);

  // Cambiar título dinámicamente
  useEffect(() => {
    if (configuracion?.titulo_app) document.title = configuracion.titulo_app;
  }, [configuracion]);

  // EFFECT: Actualizar imagen del Hero cuando cambia la región
  useEffect(() => {
    if (regionZonaSeleccionada) {
      const region = regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada);
      if (region) {
        const nuevaImagen = region.imagen_region_zona_ruta_relativa || heroImagen;
        const nuevoTitulo = region.nombre_region_zona || heroTitulo;
        
        setHeroImagenActual(nuevaImagen);
        setHeroTituloActual(nuevoTitulo);
      }
    } else {
      setHeroImagenActual(heroImagen);
      setHeroTituloActual(heroTitulo);
    }
  }, [regionZonaSeleccionada, regionesZonasHabilitadas, heroImagen, heroTitulo]);

  // Reset al cargar
  useEffect(() => {
    setSeccionActiva(null);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setResultadosBusqueda(null);
    setRegionZonaSeleccionada(null);
    setHeroImagenActual(heroImagen);
    setHeroTituloActual(heroTitulo);
  }, [heroImagen, heroTitulo]);

  // Manejar cambio de región/zona
  const handleRegionZonaChange = (regionZonaId: number | null) => {
    setRegionZonaSeleccionada(regionZonaId);
    setResultadosBusqueda(null);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
  };

  // ✅ FUNCIÓN OPTIMIZADA: Confía en el hook useApi para el filtrado
  const obtenerLugaresFiltrados = () => {
    if (resultadosBusqueda) {
      // useApi ya devuelve solo resultados habilitados
      return regionZonaSeleccionada 
        ? resultadosBusqueda.filter(lugar => lugar.id_region_zona === regionZonaSeleccionada)
        : resultadosBusqueda;
    } 
    if (mostrarDestacados) {
      // useApi ya devuelve solo lugares destacados habilitados
      return regionZonaSeleccionada 
        ? lugaresDestacados.filter(lugar => lugar.id_region_zona === regionZonaSeleccionada)
        : lugaresDestacados;
    } 
    if (seccionSeleccionada) {
      // useApi ya devuelve secciones con subsecciones habilitadas
      return regionZonaSeleccionada 
        ? seccionSeleccionada.subsecciones.filter(lugar => lugar.id_region_zona === regionZonaSeleccionada)
        : seccionSeleccionada.subsecciones;
    }
    
    // useApi ya devuelve solo secciones y subsecciones habilitadas
    return getSeccionesPorRegionZona(regionZonaSeleccionada)
      .flatMap(seccion => seccion.subsecciones);
  };

  // ✅ OPTIMIZADO: useApi ya filtra por región y habilitar
  const obtenerSeccionesFiltradas = () => getSeccionesPorRegionZona(regionZonaSeleccionada);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!configuracion) return <LoadingSpinner />;

  const lugaresFiltrados = obtenerLugaresFiltrados();
  const seccionesFiltradas = obtenerSeccionesFiltradas();
  const mostrarTodo = !seccionSeleccionada && !mostrarDestacados && !resultadosBusqueda;

  // Funciones de búsqueda
  const handleSearch = (termino: string) => {
    // useApi.buscarLugares ya filtra por habilitar === 1
    const resultados = buscarLugares(termino);
    setResultadosBusqueda(resultados);
    setMostrarDestacados(false);
    setSeccionSeleccionada(null);
    setSeccionActiva(null);
    setIsMenuOpen(false);
  };

  const handleClearSearch = () => setResultadosBusqueda(null);

  // Click en Home / Reset filtros
  const handleHomeClick = () => {
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
    setResultadosBusqueda(null);
    setIsMenuOpen(false);
    setRegionZonaSeleccionada(null);
    setHeroImagenActual(heroImagen);
    setHeroTituloActual(heroTitulo);
  };

  // Click en sección
  const handleSeccionClick = (seccion: Seccion) => {
    // useApi.seccionesHabilitadas ya filtra por habilitar === 1
    setSeccionSeleccionada(seccion);
    setMostrarDestacados(false);
    setSeccionActiva(seccion.nombre_seccion);
    setIsMenuOpen(false);
  };

  // Click en destacados
  const handleDestacadosClick = () => {
    // useApi.lugaresDestacados ya filtra por habilitar === 1 y destacado === 1
    setMostrarDestacados(true);
    setSeccionSeleccionada(null);
    setSeccionActiva('destacados');
    setIsMenuOpen(false);
  };

  // Toggle menú
  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header 
        tituloApp={configuracion.titulo_app}
        logoApp={logoUrl || getImageUrl(configuracion.logo_app_ruta_relativa)}
        onMenuToggle={handleMenuToggle}
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
        {/* HERO DINÁMICO */}
        <section id="inicio">
          <Hero 
            titulo={heroTituloActual}
            subtitulo={configuracion.footer_texto}
            imagenFondo={heroImageUrl || getImageUrl(heroImagenActual)}
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
            placeholder="Buscar lugares turísticos..."
          />
        </section>

        {/* Filtros activos */}
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

        {/* Resultados / Secciones / Destacados */}
        {resultadosBusqueda ? (
          <PlacesGrid 
            lugares={lugaresFiltrados} 
            titulo={`Resultados de búsqueda (${lugaresFiltrados.length})`} 
            onPlaceClick={setLugarSeleccionado} 
          />
        ) : (
          <>
            {mostrarDestacados && lugaresFiltrados.length > 0 && (
              <section id="destacados" className="mb-12">
                <PlacesGrid 
                  lugares={lugaresFiltrados} 
                  titulo="⭐ Lugares Destacados" 
                  onPlaceClick={setLugarSeleccionado} 
                  mostrarCategoria 
                />
              </section>
            )}

            {seccionSeleccionada && lugaresFiltrados.length > 0 && (
              <section key={seccionSeleccionada.id_seccion} className="mb-12">
                <PlacesGrid 
                  lugares={lugaresFiltrados} 
                  titulo={seccionSeleccionada.nombre_seccion} 
                  onPlaceClick={setLugarSeleccionado} 
                />
              </section>
            )}

            {mostrarTodo && seccionesFiltradas.map(seccion => (
              seccion.subsecciones.length > 0 && (
                <section key={seccion.id_seccion} className="mb-12">
                  <PlacesGrid 
                    lugares={seccion.subsecciones}
                    titulo={seccion.nombre_seccion} 
                    onPlaceClick={setLugarSeleccionado} 
                  />
                </section>
              )
            ))}

            {lugaresFiltrados.length === 0 && (
              <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                  <p className="text-gray-400 text-lg">
                    {regionZonaSeleccionada 
                      ? 'No se encontraron lugares en la región seleccionada' 
                      : 'No se encontraron lugares'}
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

      {/* PlaceDetail */}
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