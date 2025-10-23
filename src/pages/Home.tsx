// Home.tsx - VERSIÓN CORREGIDA (sin onRegionFilter)
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
  
  // ✅ NUEVO ESTADO: Imagen actual del Hero
  const [heroImagenActual, setHeroImagenActual] = useState<string>(heroImagen);
  const [heroTituloActual, setHeroTituloActual] = useState<string>(heroTitulo);

  // ✅ DEBUG: Estado de la aplicación
  const [debugMode, setDebugMode] = useState(true); // Cambiar a false para desactivar debug
  const [appStatus, setAppStatus] = useState({
    configLoaded: !!configuracion,
    sectionsLoaded: seccionesHabilitadas.length > 0,
    regionsLoaded: regionesZonasHabilitadas.length > 0,
    apiConnected: !error
  });

  // Actualizar estado de debug
  useEffect(() => {
    setAppStatus({
      configLoaded: !!configuracion,
      sectionsLoaded: seccionesHabilitadas.length > 0,
      regionsLoaded: regionesZonasHabilitadas.length > 0,
      apiConnected: !error
    });
  }, [configuracion, seccionesHabilitadas, regionesZonasHabilitadas, error]);

  // Cambiar título dinámicamente
  useEffect(() => {
    if (configuracion?.titulo_app) document.title = configuracion.titulo_app;
  }, [configuracion]);

  // ✅ NUEVO EFFECT: Actualizar imagen del Hero cuando cambia la región
  useEffect(() => {
    if (regionZonaSeleccionada) {
      const region = regionesZonasHabilitadas.find(r => r.id_region_zona === regionZonaSeleccionada);
      if (region) {
        // Usar la imagen de la región si existe, sino mantener la hero_imagen
        const nuevaImagen = region.imagen_region_zona_ruta_relativa || heroImagen;
        const nuevoTitulo = region.nombre_region_zona || heroTitulo;
        
        setHeroImagenActual(nuevaImagen);
        setHeroTituloActual(nuevoTitulo);
      }
    } else {
      // Reset a la imagen/título original cuando no hay región seleccionada
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
    // ✅ Reset también la imagen del Hero
    setHeroImagenActual(heroImagen);
    setHeroTituloActual(heroTitulo);
  }, []);

  // Manejar cambio de región/zona
  const handleRegionZonaChange = (regionZonaId: number | null) => {
    setRegionZonaSeleccionada(regionZonaId);
    setResultadosBusqueda(null);
    setSeccionSeleccionada(null);
    setMostrarDestacados(false);
    setSeccionActiva(null);
    
    // ✅ La imagen se actualiza automáticamente por el useEffect
  };

  // Obtener lugares filtrados según estado actual
  const obtenerLugaresFiltrados = () => {
    if (resultadosBusqueda) {
      return resultadosBusqueda.filter(lugar => !regionZonaSeleccionada || lugar.id_region_zona === regionZonaSeleccionada);
    } 
    if (mostrarDestacados) {
      return lugaresDestacados.filter(lugar => !regionZonaSeleccionada || lugar.id_region_zona === regionZonaSeleccionada);
    } 
    if (seccionSeleccionada) {
      return seccionSeleccionada.subsecciones.filter(lugar => !regionZonaSeleccionada || lugar.id_region_zona === regionZonaSeleccionada);
    }
    // Todas las secciones filtradas por región/zona
    return getSeccionesPorRegionZona(regionZonaSeleccionada).flatMap(seccion => seccion.subsecciones);
  };

  const obtenerSeccionesFiltradas = () => getSeccionesPorRegionZona(regionZonaSeleccionada);

  // ✅ DEBUG: Render de emergencia si hay problemas
  if (debugMode && (!configuracion || error)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        color: 'white',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#333',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '600px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{ 
            color: '#e74c3c', 
            fontSize: '2.5rem',
            marginBottom: '20px'
          }}>
            🚨 DEBUG MODE - Home.tsx
          </h1>
          
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #e74c3c'
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>📊 Estado de la Aplicación</h2>
            <div style={{ display: 'grid', gap: '10px', textAlign: 'left' }}>
              <div><strong>Loading:</strong> {loading ? '⏳ SI' : '✅ NO'}</div>
              <div><strong>Configuración:</strong> {configuracion ? '✅ CARGADA' : '❌ NULL'}</div>
              <div><strong>Secciones:</strong> {seccionesHabilitadas.length}</div>
              <div><strong>Regiones:</strong> {regionesZonasHabilitadas.length}</div>
              <div><strong>Error:</strong> {error || 'NINGUNO'}</div>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#ffeaa7',
              color: '#d63031',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #fab1a0'
            }}>
              <strong>❌ Error detectado:</strong> {error}
            </div>
          )}

          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              margin: '10px'
            }}
          >
            🔄 Recargar Página
          </button>

          <button 
            onClick={() => setDebugMode(false)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              margin: '10px'
            }}
          >
            🚀 Intentar Cargar App Normal
          </button>

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
            <p>Si ves este mensaje, hay problemas cargando los datos de la API.</p>
            <p>Verifica la conexión y que todas las APIs estén funcionando.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render normal de la aplicación
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!configuracion) return <LoadingSpinner />;

  const lugaresFiltrados = obtenerLugaresFiltrados();
  const seccionesFiltradas = obtenerSeccionesFiltradas();
  const mostrarTodo = !seccionSeleccionada && !mostrarDestacados && !resultadosBusqueda;

  // Funciones de búsqueda
  const handleSearch = (termino: string) => {
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
    // ✅ Reset también la imagen del Hero
    setHeroImagenActual(heroImagen);
    setHeroTituloActual(heroTitulo);
  };

  // Click en sección
  const handleSeccionClick = (seccion: Seccion) => {
    setSeccionSeleccionada(seccion);
    setMostrarDestacados(false);
    setSeccionActiva(seccion.nombre_seccion);
    setIsMenuOpen(false);
  };

  // Click en destacados
  const handleDestacadosClick = () => {
    setMostrarDestacados(true);
    setSeccionSeleccionada(null);
    setSeccionActiva('destacados');
    setIsMenuOpen(false);
  };

  // Toggle menú
  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* ✅ DEBUG BANNER (solo en desarrollo) */}
      {debugMode && process.env.NODE_ENV === 'development' && (
        <div style={{
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          color: 'white',
          padding: '8px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000
        }}>
          🔧 DEBUG MODE ACTIVADO | 
          Config: {appStatus.configLoaded ? '✅' : '❌'} | 
          Sections: {appStatus.sectionsLoaded ? '✅' : '❌'} | 
          Regions: {appStatus.regionsLoaded ? '✅' : '❌'} |
          API: {appStatus.apiConnected ? '✅' : '❌'}
        </div>
      )}

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
        {/* HERO DINÁMICO */}
        <section id="inicio">
          <Hero 
            titulo={heroTituloActual} // ✅ Usar título dinámico
            subtitulo={configuracion.footer_texto}
            imagenFondo={getImageUrl(heroImagenActual)} // ✅ Usar imagen dinámica
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

      {/* ✅ CORREGIDO: PlaceDetail sin onRegionFilter */}
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