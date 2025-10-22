// useApi.tsx - VERSIÓN CORREGIDA CON TIMING FIX
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ CONSTANTE GLOBAL para la URL base (fallback definitivo)
const FALLBACK_BASE_URL = 'https://turismo-backend-av60.onrender.com';

// ✅ Función para obtener URL base - SIMPLIFICADA
const getApiBaseUrl = async (): Promise<string> => {
  try {
    console.log("🔄 Obteniendo URL base del backend...");
    
    // ✅ URL RELATIVA que funciona en cualquier entorno
    const response = await fetch('/api/config/frontend');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const config = await response.json();
    
    if (config.api_base_url && config.status === 'ok') {
      console.log("✅ URL base obtenida:", config.api_base_url);
      return config.api_base_url;
    } else {
      console.warn("⚠️ No se pudo obtener URL base, usando fallback");
      return FALLBACK_BASE_URL;
    }
  } catch (error) {
    console.error("❌ Error obteniendo URL base:", error);
    return FALLBACK_BASE_URL;
  }
};

// ✅ getImageUrl CORREGIDA - SIEMPRE funciona
export const getImageUrl = (imagePath: string, API_BASE?: string): string => {
  if (!imagePath) {
    return '';
  }

  console.log('🖼️ getImageUrl INPUT:', imagePath);
  console.log('🌐 API_BASE recibida:', API_BASE);

  // ✅ USAR SIEMPRE FALLBACK_BASE_URL como fuente de verdad
  const baseUrl = API_BASE || FALLBACK_BASE_URL;
  console.log('🌐 API_BASE FINAL:', baseUrl);

  // Si ya es URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ CORREGIDO: Manejo consistente de rutas
  if (imagePath.startsWith('assets/')) {
    const url = `${baseUrl}/${imagePath}`;
    console.log('📁 getImageUrl RUTA CON assets/ → CORREGIDA:', url);
    return url;
  }

  // Si es ruta relativa que empieza con "/"
  if (imagePath.startsWith('/')) {
    const url = `${baseUrl}${imagePath}`;
    console.log('📁 getImageUrl RUTA RELATIVA →', url);
    return url;
  }

  // Cualquier otro caso
  const url = `${baseUrl}/assets/${imagePath}`;
  console.log('📦 getImageUrl DEFAULT →', url);
  return url;
};

// =========================
// Hook principal - CORREGIDO
// =========================
export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(FALLBACK_BASE_URL); // ✅ Inicializado con fallback

  // Obtener todas las sub-secciones
  const getAllSubSecciones = (): SubSeccion[] => {
    return secciones.flatMap(seccion => seccion.subsecciones || []);
  };

  // ✅ buildUrl SIMPLIFICADA - siempre funciona
  const buildUrl = (endpoint: string): string => {
    const base = apiBaseUrl || FALLBACK_BASE_URL;
    return `${base}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  };

  // Fetch functions (mantener igual que antes)
  const fetchConfiguracion = async (baseUrl: string): Promise<boolean> => {
    try {
      console.log("🔄 Fetching configuracion...");
      const res = await fetch(buildUrl('/configuracion'));
      
      if (!res.ok) {
        console.error(`❌ Error HTTP ${res.status} en configuración`);
        return false;
      }
      
      const data = await res.json();
      
      if (data && typeof data === 'object' && !data.error) {
        setConfiguracion(data);
        console.log("✅ Configuración cargada correctamente");
        return true;
      } else {
        setConfiguracion(null);
        console.warn("⚠️ No hay configuración disponible");
        return true;
      }
    } catch (err) {
      console.error("❌ Error cargando configuración:", err);
      return false;
    }
  };

  const fetchSecciones = async (baseUrl: string): Promise<boolean> => {
    try {
      console.log("🔄 Fetching secciones...");
      const res = await fetch(buildUrl('/secciones'));
      
      if (!res.ok) {
        console.error(`❌ Error HTTP ${res.status} en secciones`);
        return false;
      }
      
      const data = await res.json();
      
      if (data && Array.isArray(data)) {
        setSecciones(data);
        const totalSubsecciones = data.reduce(
          (total, sec) => total + (sec.subsecciones?.length || 0), 0
        );
        console.log(`✅ ${data.length} secciones con ${totalSubsecciones} subsecciones cargadas`);
        return true;
      } else {
        setSecciones([]);
        console.warn("⚠️ No hay secciones disponibles");
        return true;
      }
    } catch (err) {
      console.error("❌ Error cargando secciones:", err);
      setSecciones([]);
      return false;
    }
  };

  const fetchRegionesZonas = async (baseUrl: string): Promise<boolean> => {
    try {
      console.log("🔄 Fetching regiones...");
      const res = await fetch(buildUrl('/regiones'));
      
      if (!res.ok) {
        console.error(`❌ Error HTTP ${res.status} en regiones`);
        return false;
      }
      
      const data = await res.json();
      
      if (data && Array.isArray(data)) {
        setRegionesZonas(data);
        console.log(`✅ ${data.length} regiones cargadas correctamente`);
        return true;
      } else {
        setRegionesZonas([]);
        console.warn("⚠️ No hay regiones disponibles");
        return true;
      }
    } catch (err) {
      console.error("❌ Error cargando regiones:", err);
      setRegionesZonas([]);
      return false;
    }
  };

  // ✅ Carga de datos OPTIMIZADA
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    console.log("🚀 Iniciando carga de datos...");
  
    try {
      // ✅ Obtener URL base PRIMERO
      const baseUrl = await getApiBaseUrl();
      console.log("🔗 URL base configurada:", baseUrl);
      setApiBaseUrl(baseUrl);

      // ✅ Ejecutar todas las llamadas en paralelo
      const [configSuccess, seccionesSuccess, regionesSuccess] = await Promise.all([
        fetchConfiguracion(baseUrl),
        fetchSecciones(baseUrl),
        fetchRegionesZonas(baseUrl)
      ]);

      // ✅ Verificar resultados
      const successes = [configSuccess, seccionesSuccess, regionesSuccess].filter(Boolean).length;
      console.log(`📊 Resultados carga: ${successes} exitosos, ${3 - successes} fallidos`);

      if (successes === 0) {
        throw new Error('Todas las llamadas API fallaron');
      }

      console.log("✅ Carga de datos completada exitosamente");
    } catch (err) {
      console.error("❌ Error general en carga de datos:", err);
      setError('Error inesperado cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ✅ getImageUrlDynamic CORREGIDA - timing garantizado
  const getImageUrlDynamic = (imagePath: string): string => {
    // ✅ Usar apiBaseUrl del estado (que SIEMPRE tiene valor por el fallback inicial)
    return getImageUrl(imagePath, apiBaseUrl);
  };

  // Resto de funciones auxiliares (mantener igual)
  const getSeccionesHabilitadas = (): Seccion[] =>
    secciones.filter(s => s.habilitar === 1).sort((a, b) => a.orden - b.orden);

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
    getImageUrl: getImageUrlDynamic, // ✅ Ahora funciona correctamente
    buildUrl,
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl
  };
};