// useApi.tsx - VERSIÓN CON IMÁGENES DESDE BACKEND USANDO CONFIGURACIÓN
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ getImageUrl QUE USA LA BASE_URL DE LA CONFIGURACIÓN
export const getImageUrl = (imagePath: string, apiBaseUrl: string = ''): string => {
  if (!imagePath) return '/assets/placeholder.svg';
  
  console.log('🖼️ getImageUrl - input:', imagePath, 'baseUrl:', apiBaseUrl);
  
  // Si ya es una URL completa, mantenerla
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si tenemos apiBaseUrl, usar la estructura: base_url + /assets/ + endpoint
  if (apiBaseUrl) {
    // Remover cualquier / inicial del imagePath para evitar dobles //
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const fullUrl = `${apiBaseUrl}/assets/${cleanImagePath}`;
    
    console.log('🖼️ URL completa backend:', fullUrl);
    return fullUrl;
  }
  
  // Fallback: ruta local (solo para desarrollo)
  console.log('⚠️ Usando fallback local para imagen');
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Obtener la base_url de la configuración
  const getApiBaseUrl = (): string => {
    return configuracion?.base_url || 'https://turismo-backend-av60.onrender.com';
  };

  // ✅ buildUrl que usa la base_url de la configuración
  const buildUrl = (endpoint: string): string => {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  };

  // ✅ getImageUrl que usa la base_url de la configuración
  const getImageUrlWithConfig = (imagePath: string): string => {
    const baseUrl = getApiBaseUrl();
    return getImageUrl(imagePath, baseUrl);
  };

  // Fetch functions
  const fetchConfiguracion = async (): Promise<boolean> => {
    try {
      // Primera carga: usar URL por defecto para obtener la configuración
      const initialUrl = 'https://turismo-backend-av60.onrender.com/api/configuracion';
      console.log("📡 Fetching config from:", initialUrl);
      const res = await fetch(initialUrl);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      if (data && !data.error) {
        setConfiguracion(data);
        console.log("✅ Configuración cargada, base_url:", data.base_url);
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
      // 1. Primero cargar configuración para obtener base_url
      const configSuccess = await fetchConfiguracion();
      
      if (configSuccess) {
        // 2. Luego cargar el resto usando la base_url de la configuración
        const [seccionesSuccess, regionesSuccess] = await Promise.all([
          fetchSecciones(),
          fetchRegionesZonas()
        ]);

        console.log(`📊 Carga completada: ${[configSuccess, seccionesSuccess, regionesSuccess].filter(Boolean).length}/3 exitosos`);
      } else {
        throw new Error('No se pudo cargar la configuración');
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
    getImageUrl: getImageUrlWithConfig, // ← USA LA BASE_URL DE LA CONFIGURACIÓN
    buildUrl,
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl: getApiBaseUrl()
  };
};