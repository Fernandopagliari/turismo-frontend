// useApi.tsx - VERSIÓN CON URLs RELATIVAS INTELIGENTES
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ ELIMINADO: No más URLs hardcodeadas
// ✅ ESTRATEGIA: Usar URLs relativas que funcionen en cualquier entorno

// ✅ Función para obtener URL base - CON FALLBACKS INTELIGENTES
const getApiBaseUrl = async (): Promise<string> => {
  try {
    console.log("🔄 Obteniendo URL base del backend...");
    
    // ✅ PRIMERO: Intentar con URL relativa (funciona en mismo dominio)
    const response = await fetch('/api/config/frontend');
    
    if (response.ok) {
      const config = await response.json();
      if (config.api_base_url && config.status === 'ok') {
        console.log("✅ URL base obtenida del backend:", config.api_base_url);
        return config.api_base_url;
      }
    }
    
    // ✅ SEGUNDO: Si falla, usar el origen actual (mismo dominio del frontend)
    console.warn("⚠️ Usando origen actual como URL base:", window.location.origin);
    return window.location.origin;
    
  } catch (error) {
    console.error("❌ Error obteniendo URL base, usando origen actual:", error);
    // ✅ FALLBACK: El mismo dominio donde está hosteado el frontend
    return window.location.origin;
  }
};

// ✅ getImageUrl CORREGIDA - URLs RELATIVAS INTELIGENTES
export const getImageUrl = (imagePath: string, API_BASE?: string): string => {
  if (!imagePath) {
    return '';
  }

  console.log('🖼️ getImageUrl INPUT:', imagePath);
  console.log('🌐 API_BASE recibida:', API_BASE);

  // ✅ ESTRATEGIA: Si no tenemos API_BASE, usar ruta relativa
  const baseUrl = API_BASE || '';
  console.log('🌐 ESTRATEGIA FINAL:', baseUrl ? 'URL absoluta' : 'URL relativa');

  // Si ya es URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ CORREGIDO: Manejo INTELIGENTE de rutas
  if (imagePath.startsWith('assets/')) {
    // Si tenemos baseUrl, construir URL completa
    if (baseUrl) {
      const url = `${baseUrl}/${imagePath}`;
      console.log('📁 URL ABSOLUTA con assets/ →', url);
      return url;
    } else {
      // ✅ URL RELATIVA - funciona en cualquier entorno
      const url = `/${imagePath}`;
      console.log('📁 URL RELATIVA con assets/ →', url);
      return url;
    }
  }

  // Si es ruta relativa que empieza con "/"
  if (imagePath.startsWith('/')) {
    if (baseUrl) {
      const url = `${baseUrl}${imagePath}`;
      console.log('📁 URL ABSOLUTA relativa →', url);
      return url;
    } else {
      // ✅ Mantener como ruta relativa
      console.log('📁 URL RELATIVA mantenida →', imagePath);
      return imagePath;
    }
  }

  // Cualquier otro caso
  if (baseUrl) {
    const url = `${baseUrl}/assets/${imagePath}`;
    console.log('📦 URL ABSOLUTA default →', url);
    return url;
  } else {
    // ✅ URL relativa por defecto
    const url = `/assets/${imagePath}`;
    console.log('📦 URL RELATIVA default →', url);
    return url;
  }
};

// =========================
// Hook principal - CON URLs RELATIVAS
// =========================
export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(''); // ✅ Inicial vacío = URLs relativas

  // Obtener todas las sub-secciones
  const getAllSubSecciones = (): SubSeccion[] => {
    return secciones.flatMap(seccion => seccion.subsecciones || []);
  };

  // ✅ buildUrl MEJORADA - URLs relativas por defecto
  const buildUrl = (endpoint: string): string => {
    // Si no tenemos apiBaseUrl, usar URL relativa (funciona en mismo dominio)
    if (!apiBaseUrl) {
      return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
    // Si tenemos apiBaseUrl, usar URL absoluta
    return `${apiBaseUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  };

  // Fetch functions actualizadas para usar buildUrl
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
      // ✅ Obtener URL base PRIMERO
      const baseUrl = await getApiBaseUrl();
      console.log("🔗 URL base configurada:", baseUrl || '(URLs relativas)');
      setApiBaseUrl(baseUrl);

      // ✅ Ejecutar llamadas en paralelo
      const [configSuccess, seccionesSuccess, regionesSuccess] = await Promise.all([
        fetchConfiguracion(),
        fetchSecciones(),
        fetchRegionesZonas()
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

  // ✅ getImageUrlDynamic CORREGIDA - maneja tanto URLs absolutas como relativas
  const getImageUrlDynamic = (imagePath: string): string => {
    return getImageUrl(imagePath, apiBaseUrl);
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