// Home.tsx - VERSIÓN COMPLETA OPTIMIZADA
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
  
  // Estado: Imagen actual del Hero - SIMPLIFICADO Y OPTIMIZADO
  const [heroImagenActual, setHeroImagenActual] = useState<string>(heroImagen);
  const [heroTituloActual, setHeroTituloActual] = useState<string>(heroTitulo);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [heroImageLoading, setHeroImageLoading] = useState<boolean>(true);
  const [heroImageError, setHeroImageError] = useState<boolean>(false);

  // DEBUG: Verificar estado real
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Home - Estado REAL:', {
        heroImagen,
        heroImagenActual,
        heroImageUrl,
        heroImageLoading,
        heroImageError,
        configuracion: !!configuracion,
        loading
      });
    }
  }, [heroImagen, heroImagenActual, heroImageUrl, heroImageLoading, heroImageError, configuracion, loading]);

  // ✅ SOLUCIÓN: Carga DIRECTA y ROBUSTA de imagen Hero
  useEffect(() => {
    if (!configuracion) return;

    const loadHeroImageDirect = async () => {
      try {
        setHeroImageLoading(true);
        setHeroImageError(false);
        
        console.log('🔄 Home - Cargando imagen Hero directamente:', heroImagenActual);
        
        const imageUrl = getImageUrl(heroImagenActual);
        console.log('📷 Home - URL de imagen Hero:', imageUrl);
        
        // Verificar si la imagen existe con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        try {
          const response = await fetch(imageUrl, { 
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            console.log('✅ Home - Imagen Hero existe en servidor');
            setHeroImageUrl(imageUrl);
            setHeroImageError(false);
          } else {
            console.warn('⚠️ Home - Imagen Hero no encontrada, usando fallback');
            setHeroImageError(true);
            // Fallback a imagen por defecto
            const fallbackUrl = getImageUrl('assets/imagenes/portadas/p_ischigualasto.jpg');
            setHeroImageUrl(fallbackUrl);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error('💥 Home - Error fetch HEAD:', fetchError);
          setHeroImageError(true);
          // Fallback absoluto
          const fallbackUrl = getImageUrl('assets/imagenes/portadas/p_ischigualasto.jpg');
          setHeroImageUrl(fallbackUrl);
        }
      } catch (error) {
        console.error('💥 Home - Error general cargando imagen Hero:', error);
        setHeroImageError(true);
        // Fallback absoluto
        const fallbackUrl = getImageUrl('assets/imagenes/portadas/p_ischigualasto.jpg');
        setHeroImageUrl(fallbackUrl);
      } finally {
        setHeroImageLoading(false);
      }
    };

    loadHeroImageDirect();
  }, [heroImagenActual, configuracion]);

  // Cambiar título dinámicamente
  useEffect(() => {
    if (configuracion?.titulo_app) {
      document.title = configuracion.titulo_app;
    }
  }, [configuracion]);

  // EFFECT: Actualizar imagen del Hero cuando cambia la región
  useEffect(() => {
    if (regionZonaSeleccionada) {
      const region = regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada);
      if (region) {
        const nuevaImagen = region.imagen_region_zona_ruta_relativa || heroImagen;
        const nuevoTitulo = region.nombre_region_zona || heroTitulo;
        
        console.log('🔄 Home - Cambiando región:', {
          region: region.nombre_region_zona,
          nuevaImagen,
          nuevoTitulo
        });
        
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
    console.log('📍 Home - Cambio de región:', regionZonaId);
    setRegionZonaSeleccionada(regionZonaId);
    setResultadosBusqueda(null);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
  };

  // ✅ FUNCIÓN OPTIMIZADA: Confía en el hook useApi para el filtrado
  const obtenerLugaresFiltrados = () => {
    if (resultadosBusqueda) {
      return regionZonaSeleccionada 
        ? resultadosBusqueda.filter(lugar => lugar.id_region_zona === regionZonaSeleccionada)
        : resultadosBusqueda;
    } 
    if (mostrarDestacados) {
      return regionZonaSeleccionada 
        ? lugaresDestacados.filter(lugar => lugar.id_region_zona === regionZonaSeleccionada)
        : lugaresDestacados;
    } 
    if (seccionSeleccionada) {
      return regionZonaSeleccionada 
        ? seccionSeleccionada.subsecciones.filter(lugar => lugar.id_region_zona === regionZonaSeleccionada)
        : seccionSeleccionada.subsecciones;
    }
    
    return getSeccionesPorRegionZona(regionZonaSeleccionada)
      .flatMap(seccion => seccion.subsecciones);
  };

  const obtenerSeccionesFiltradas = () => getSeccionesPorRegionZona(regionZonaSeleccionada);

  // ✅ Mostrar loading mientras se cargan las configuraciones
  if (loading || !configuracion) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-center p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Error de conexión</h2>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const lugaresFiltrados = obtenerLugaresFiltrados();
  const seccionesFiltradas = obtenerSeccionesFiltradas();
  const mostrarTodo = !seccionSeleccionada && !mostrarDestacados && !resultadosBusqueda;

  // Funciones de búsqueda
  const handleSearch = (termino: string) => {
    console.log('🔍 Home - Búsqueda:', termino);
    const resultados = buscarLugares(termino);
    setResultadosBusqueda(resultados);
    setMostrarDestacados(false);
    setSeccionSeleccionada(null);
    setSeccionActiva(null);
    setIsMenuOpen(false);
  };

  const handleClearSearch = () => {
    console.log('🗑️ Home - Limpiando búsqueda');
    setResultadosBusqueda(null);
  };

  // Click en Home / Reset filtros
  const handleHomeClick = () => {
    console.log('🏠 Home - Click en Home');
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
    console.log('📂 Home - Click en sección:', seccion.nombre_seccion);
    setSeccionSeleccionada(seccion);
    setMostrarDestacados(false);
    setSeccionActiva(seccion.nombre_seccion);
    setIsMenuOpen(false);
  };

  // Click en destacados
  const handleDestacadosClick = () => {
    console.log('⭐ Home - Click en destacados');
    setMostrarDestacados(true);
    setSeccionSeleccionada(null);
    setSeccionActiva('destacados');
    setIsMenuOpen(false);
  };

  // Toggle menú
  const handleMenuToggle = () => {
    console.log('🍔 Home - Toggle menú:', !isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header 
        tituloApp={configuracion.titulo_app}
        logoApp={getImageUrl(configuracion.logo_app_ruta_relativa)}
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
        {/* HERO SIMPLIFICADO - FORZAR VISUALIZACIÓN */}
        <section id="inicio">
          {heroImageLoading ? (
            <div className="w-full bg-gray-800 flex items-center justify-center py-20">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-white text-lg">Cargando destino turístico...</p>
              </div>
            </div>
          ) : (
            <div>
              {/* DEBUG: Mostrar información de la imagen */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-800 text-white p-3 text-sm">
                  <div>🔍 DEBUG Home:</div>
                  <div>URL: {heroImageUrl}</div>
                  <div>Estado: {heroImageError ? 'ERROR' : 'OK'}</div>
                  <div>Imagen: {heroImagenActual}</div>
                </div>
              )}
              <Hero 
                titulo={heroTituloActual}
                subtitulo={configuracion.footer_texto}
                imagenFondo={heroImageUrl}
                regionZonaSeleccionada={
                  regionZonaSeleccionada 
                    ? regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada) 
                    : null
                }
                isLoading={false}
              />
            </div>
          )}
        </section>

        {/* Barra de búsqueda */}
        <section className="container mx-auto px-4 py-8">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Buscar lugares turísticos, hoteles, restaurantes..."
          />
        </section>

        {/* Filtros activos */}
        {(seccionActiva || regionZonaSeleccionada) && (
          <div className="container mx-auto px-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {regionZonaSeleccionada && (
                    <span className="inline-flex items-center bg-green-900 bg-opacity-50 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      📍 {regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada)?.nombre_region_zona}
                    </span>
                  )}
                  {seccionActiva && (
                    <span className="inline-flex items-center bg-blue-900 bg-opacity-50 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {seccionActiva === 'destacados' ? '⭐ Destacados' : `📂 ${seccionActiva}`}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleHomeClick} 
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Ver todo
                  </button>
                  {regionZonaSeleccionada && (
                    <button 
                      onClick={() => setRegionZonaSeleccionada(null)} 
                      className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Quitar región
                    </button>
                  )}
                </div>
              </div>
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
              <div className="container mx-auto px-4 py-16 text-center">
                <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {regionZonaSeleccionada 
                      ? 'No hay lugares en esta región' 
                      : 'No se encontraron lugares'
                    }
                  </h3>
                  <p className="text-gray-400 text-lg mb-6">
                    {regionZonaSeleccionada 
                      ? 'Prueba con otra región o quita los filtros para ver todos los lugares disponibles.'
                      : 'Intenta con otros términos de búsqueda o explora las categorías disponibles.'
                    }
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={handleHomeClick} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      Ver todos los lugares
                    </button>
                    {regionZonaSeleccionada && (
                      <button 
                        onClick={() => setRegionZonaSeleccionada(null)} 
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                      >
                        Quitar filtro región
                      </button>
                    )}
                  </div>
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