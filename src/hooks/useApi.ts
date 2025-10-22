// useApi.tsx - VERSIÓN CORREGIDA
// useApi.tsx - VERSIÓN COMPLETA SIN HARCODING
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona, FrontendConfig } from '../types/tourism';

// ✅ getImageUrl SIN HARCODING
export const getImageUrl = (imagePath: string, apiBaseUrl: string = ''): string => {
  if (!imagePath) return '/assets/placeholder.svg';
  
  console.log('🖼️ getImageUrl - input:', imagePath, 'baseUrl:', apiBaseUrl);
  
  if (imagePath.startsWith('http')) return imagePath;
  
  // ✅ SOLO si tenemos apiBaseUrl, usarla
  if (apiBaseUrl) {
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const fullUrl = `${apiBaseUrl}/assets/${cleanImagePath}`;
    console.log('🖼️ URL completa backend:', fullUrl);
    return fullUrl;
  }
  
  // ✅ Si no hay apiBaseUrl, usar ruta relativa
  console.log('⚠️ Sin base_url, usando ruta relativa');
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [frontendConfig, setFrontendConfig] = useState<FrontendConfig | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Obtener la base_url DEL ENDPOINT CORRECTO
  const getApiBaseUrl = (): string => {
    return frontendConfig?.api_base_url || '';
  };

  // ✅ buildUrl que usa la base_url correcta - SIN HARCODING
  const buildUrl = (endpoint: string): string => {
    const baseUrl = getApiBaseUrl();
    
    // ✅ Si tenemos base_url, usarla; si no, usar ruta relativa
    if (baseUrl) {
      return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    } else {
      // ✅ Sin base_url, usar endpoint relativo
      return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
  };

  // ✅ NUEVO: Fetch configuración frontend - SIN HARCODING
  const fetchFrontendConfig = async (): Promise<boolean> => {
    try {
      // ✅ Usar ruta relativa - el browser completa con el origen actual
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

  // Fetch functions existentes (modificadas para usar buildUrl)
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
      // 1. PRIMERO cargar configuración frontend para obtener base_url
      const frontendConfigSuccess = await fetchFrontendConfig();
      
      if (frontendConfigSuccess) {
        // 2. LUEGO cargar el resto usando la base_url obtenida
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

  // ✅ getImageUrl que usa la base_url correcta - SIN HARCODING
  const getImageUrlWithConfig = (imagePath: string): string => {
    const baseUrl = getApiBaseUrl();
    return getImageUrl(imagePath, baseUrl);
  };

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
    getImageUrl: getImageUrlWithConfig,
    buildUrl,
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl: getApiBaseUrl()
  };
};