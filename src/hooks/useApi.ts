// useApi.tsx - VERSIÓN COMPLETA CORREGIDA
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona, FrontendConfig } from '../types/tourism';

export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [frontendConfig, setFrontendConfig] = useState<FrontendConfig | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Obtener la apiBaseUrl
  const getApiBaseUrl = (): string => {
    return frontendConfig?.api_base_url || '';
  };

  // ✅ getImageUrl CORREGIDA - Maneja ambos casos
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/assets/placeholder.svg';
    
    const apiBaseUrl = frontendConfig?.api_base_url || '';
    console.log('🖼️ getImageUrl - apiBaseUrl:', apiBaseUrl, 'imagePath:', imagePath);
    
    if (imagePath.startsWith('http')) return imagePath;
    
    // ✅ SI tenemos apiBaseUrl, usarla para imágenes del backend
    if (apiBaseUrl) {
      const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const fullUrl = `${apiBaseUrl}/assets/${cleanImagePath}`;
      console.log('🖼️ URL completa backend:', fullUrl);
      return fullUrl;
    }
    
    // ✅ SI NO tenemos apiBaseUrl, usar ruta local (build actual)
    console.log('⚠️ Sin apiBaseUrl, usando ruta local del build');
    
    // Para el build actual que tiene assets/ duplicado
    if (imagePath.startsWith('assets/')) {
      // "assets/imagenes/..." → "/assets/assets/imagenes/..." (build actual)
      return `/${imagePath}`;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath; // Mantener rutas absolutas
    }
    
    return `/${imagePath}`; // Hacer ruta absoluta
  };

  // ✅ buildUrl que usa la apiBaseUrl correcta
  const buildUrl = (endpoint: string): string => {
    const apiBaseUrl = getApiBaseUrl();
    
    if (apiBaseUrl) {
      return `${apiBaseUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    } else {
      return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
  };

  // ✅ Fetch configuración frontend
  const fetchFrontendConfig = async (): Promise<boolean> => {
    try {
      const url = '/api/config/frontend';
      console.log("📡 Fetching FRONTEND config from:", url);
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data: FrontendConfig = await res.json();
      console.log("🔍 Configuración Frontend recibida:", data);
      
      if (data && data.status === 'ok') {
        setFrontendConfig(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error frontend config:", err);
      return false;
    }
  };

  const fetchConfiguracion = async (): Promise<boolean> => {
    try {
      const url = buildUrl('/configuracion');
      console.log("📡 Fetching config from:", url);
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      if (data && !data.error) {
        setConfiguracion(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error config:", err);
      return false;
    }
  };

  const fetchSecciones = async (): Promise<boolean> => {
    try {
      const url = buildUrl('/secciones');
      console.log("📡 Fetching secciones from:", url);
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setSecciones(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error secciones:", err);
      return false;
    }
  };

  const fetchRegionesZonas = async (): Promise<boolean> => {
    try {
      const url = buildUrl('/regiones');
      console.log("📡 Fetching regiones from:", url);
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setRegionesZonas(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error regiones:", err);
      return false;
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const frontendConfigSuccess = await fetchFrontendConfig();
      
      if (frontendConfigSuccess) {
        const [configSuccess, seccionesSuccess, regionesSuccess] = await Promise.all([
          fetchConfiguracion(),
          fetchSecciones(),
          fetchRegionesZonas()
        ]);

        console.log(`📊 Carga completada: ${[frontendConfigSuccess, configSuccess, seccionesSuccess, regionesSuccess].filter(Boolean).length}/4 exitosos`);
      } else {
        throw new Error('No se pudo cargar la configuración frontend');
      }
    } catch (err) {
      setError('Error cargando datos');
      console.error('❌ Error en carga:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Resto de funciones auxiliares...
  const getSeccionesHabilitadas = (): Seccion[] =>
    secciones.filter(s => s.habilitar === 1).sort((a, b) => a.orden - b.orden);

  const getAllSubSecciones = (): SubSeccion[] =>
    secciones.flatMap(seccion => seccion.subsecciones || []);

  const getAllSubSeccionesHabilitadas = (): SubSeccion[] =>
    getAllSubSecciones().filter(s => s.habilitar === 1).sort((a, b) => a.orden - b.orden);

  const getSubSeccionesPorSeccion = (idSeccion: number): SubSeccion[] =>
    secciones.find(s => s.id_seccion === idSeccion)?.subsecciones?.filter(sub => sub.habilitar === 1) || [];

  const getSubSeccionesPorRegionZona = (regionZonaId: number | null): SubSeccion[] => {
    const todas = getAllSubSeccionesHabilitadas();
    return regionZonaId ? todas.filter(s => s.id_region_zona === regionZonaId) : todas;
  };

  const getSeccionesPorRegionZona = (regionZonaId: number | null): Seccion[] => {
    const subFiltradas = getSubSeccionesPorRegionZona(regionZonaId);
    const ids = [...new Set(subFiltradas.map(s => s.id_seccion))];
    return getSeccionesHabilitadas().map(s => ({
      ...s,
      subsecciones: subFiltradas.filter(sub => sub.id_seccion === s.id_seccion)
    })).filter(s => ids.includes(s.id_seccion));
  };

  const buscarLugares = (termino: string): SubSeccion[] =>
    getAllSubSeccionesHabilitadas().filter(s => 
      s.nombre_sub_seccion.toLowerCase().includes(termino.toLowerCase())
    );

  const getLugaresDestacados = (): SubSeccion[] =>
    getAllSubSeccionesHabilitadas().filter(s => s.destacado === 1).slice(0, 8);

  const getRegionesZonasHabilitadas = (): RegionZona[] =>
    regionesZonas.filter(r => r.habilitar === 1).sort((a, b) => a.orden - b.orden);

  return {
    configuracion,
    frontendConfig,
    regionesZonas,
    secciones,
    subSecciones: getAllSubSeccionesHabilitadas(),
    seccionesHabilitadas: getSeccionesHabilitadas(),
    regionesZonasHabilitadas: getRegionesZonasHabilitadas(),
    lugaresDestacados: getLugaresDestacados(),
    getSubSeccionesHabilitadas: getSubSeccionesPorSeccion,
    getSubSeccionesPorRegionZona,
    getSeccionesPorRegionZona,
    buscarLugares,
    getImageUrl,
    buildUrl,
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl: getApiBaseUrl()
  };
};