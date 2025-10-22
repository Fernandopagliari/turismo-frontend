// useApi.tsx - VERSIÓN CON CACHE DE URL BASE
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ CACHE GLOBAL para la URL base (evita problemas de timing)
let cachedBaseUrl: string | null = null;

// ✅ Función para obtener URL base - CON CACHE
const getApiBaseUrl = async (): Promise<string> => {
  // ✅ Si ya tenemos la URL en cache, usarla
  if (cachedBaseUrl) {
    console.log("🔄 Usando URL base desde cache:", cachedBaseUrl);
    return cachedBaseUrl;
  }

  try {
    console.log("🔄 Obteniendo URL base del backend...");
    
    // ✅ URL relativa que funciona en cualquier entorno
    const response = await fetch('/api/config/frontend');
    
    if (response.ok) {
      const config = await response.json();
      if (config.api_base_url && config.status === 'ok') {
        console.log("✅ URL base obtenida del backend:", config.api_base_url);
        cachedBaseUrl = config.api_base_url; // ✅ Guardar en cache
        return config.api_base_url;
      }
    }
    
    // ✅ Fallback al origen actual
    console.warn("⚠️ Usando origen actual como URL base:", window.location.origin);
    cachedBaseUrl = window.location.origin;
    return cachedBaseUrl;
    
  } catch (error) {
    console.error("❌ Error obteniendo URL base, usando origen actual:", error);
    cachedBaseUrl = window.location.origin;
    return cachedBaseUrl;
  }
};

// ✅ getImageUrl MEJORADA - SIEMPRE tiene URL base válida
export const getImageUrl = (imagePath: string, API_BASE?: string): string => {
  if (!imagePath) {
    return '';
  }

  console.log('🖼️ getImageUrl INPUT:', imagePath);
  console.log('🌐 API_BASE recibida:', API_BASE);

  // ✅ ESTRATEGIA: Usar cache global si API_BASE es undefined
  const baseUrl = API_BASE || cachedBaseUrl || window.location.origin;
  console.log('🌐 URL BASE FINAL:', baseUrl);

  // Si ya es URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ CORREGIDO: Construcción de URL consistente
  if (imagePath.startsWith('assets/')) {
    const url = `${baseUrl}/${imagePath}`;
    console.log('📁 URL con assets/ →', url);
    return url;
  }

  // Si es ruta relativa que empieza con "/"
  if (imagePath.startsWith('/')) {
    const url = `${baseUrl}${imagePath}`;
    console.log('📁 URL relativa →', url);
    return url;
  }

  // Cualquier otro caso
  const url = `${baseUrl}/assets/${imagePath}`;
  console.log('📦 URL default →', url);
  return url;
};

// =========================
// Hook principal - CON CACHE
// =========================
export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');

  // Obtener todas las sub-secciones
  const getAllSubSecciones = (): SubSeccion[] => {
    return secciones.flatMap(seccion => seccion.subsecciones || []);
  };

  // ✅ buildUrl MEJORADA - usa cache si es necesario
  const buildUrl = (endpoint: string): string => {
    const base = apiBaseUrl || cachedBaseUrl || '';
    if (base) {
      return `${base}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
    // URL relativa por defecto
    return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  };

  // Fetch functions (simplificadas)
  const fetchConfiguracion = async (): Promise<boolean> => {
    try {
      console.log("🔄 Fetching configuracion...");
      const url = buildUrl('/configuracion');
      console.log("📡 URL de configuración:", url);
      
      const res = await fetch(url);
      
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

  const fetchSecciones = async (): Promise<boolean> => {
    try {
      console.log("🔄 Fetching secciones...");
      const url = buildUrl('/secciones');
      console.log("📡 URL de secciones:", url);
      
      const res = await fetch(url);
      
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

  const fetchRegionesZonas = async (): Promise<boolean> => {
    try {
      console.log("🔄 Fetching regiones...");
      const url = buildUrl('/regiones');
      console.log("📡 URL de regiones:", url);
      
      const res = await fetch(url);
      
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
      // ✅ Obtener URL base PRIMERO y establecer cache
      const baseUrl = await getApiBaseUrl();
      console.log("🔗 URL base configurada:", baseUrl);
      setApiBaseUrl(baseUrl);

      // ✅ Ejecutar llamadas en paralelo
      const [configSuccess, seccionesSuccess, regionesSuccess] = await Promise.all([
        fetchConfiguracion(),
        fetchSecciones(),
        fetchRegionesZonas()
      ]);

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

  // ✅ getImageUrlDynamic MEJORADA - usa cache global
  const getImageUrlDynamic = (imagePath: string): string => {
    console.log('🔍 getImageUrlDynamic - apiBaseUrl:', apiBaseUrl);
    console.log('🔍 getImageUrlDynamic - cachedBaseUrl:', cachedBaseUrl);
    
    // ✅ Usar cache global si apiBaseUrl está vacío
    const effectiveBaseUrl = apiBaseUrl || cachedBaseUrl;
    return getImageUrl(imagePath, effectiveBaseUrl);
  };

  // Resto de funciones auxiliares (sin cambios)
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
    getImageUrl: getImageUrlDynamic,
    buildUrl,
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl
  };
};