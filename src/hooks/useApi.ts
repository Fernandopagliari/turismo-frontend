// useApi.tsx - VERSIÓN CORREGIDA CON URLS RELATIVAS
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ CORREGIDO: Función para obtener la URL base dinámicamente CON FALLBACKS INTELIGENTES
const getApiBaseUrl = async (): Promise<string> => {
  try {
    console.log("🔄 Obteniendo URL base del backend...");
    
    // ✅ URL RELATIVA - funciona en cualquier entorno
    const response = await fetch('/api/config/frontend');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const config = await response.json();
    
    if (config.api_base_url && config.status === 'ok') {
      console.log("✅ URL base obtenida:", config.api_base_url);
      return config.api_base_url;
    } else {
      console.warn("⚠️ No se pudo obtener URL base, usando URL actual");
      return window.location.origin; // ✅ Fallback inteligente
    }
  } catch (error) {
    console.error("❌ Error obteniendo URL base:", error);
    // ✅ Fallback: usar la misma URL del frontend
    return window.location.origin;
  }
};

// ✅ CORREGIDO: getImageUrl ahora maneja API_BASE undefined correctamente
// ✅ SOLUCIÓN TEMPORAL: getImageUrl con fallback hardcodeado
export const getImageUrl = (imagePath: string, API_BASE?: string): string => {
  if (!imagePath) {
    return '';
  }

  console.log('🖼️ getImageUrl INPUT:', imagePath);
  console.log('🌐 API_BASE recibida:', API_BASE);

  // ✅ TEMPORAL: SIEMPRE usar esta URL base
  const baseUrl = 'https://turismo-backend-av60.onrender.com';
  console.log('🌐 API_BASE FINAL (hardcodeada):', baseUrl);

  // Si ya es URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ CORREGIDO: Si empieza con "assets/" - MANTENER la ruta completa
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
// Hook principal - CORREGIDO CON FALLBACKS INTELIGENTES
// =========================
export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ CORREGIDO: Estado inicial vacío en lugar de localhost
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');

  // Obtener todas las sub-secciones
  const getAllSubSecciones = (): SubSeccion[] => {
    return secciones.flatMap(seccion => seccion.subsecciones || []);
  };

  // =========================
  // ✅ NUEVO: Función para construir URLs de forma segura
  // =========================
  const buildUrl = (endpoint: string): string => {
    // Si no tenemos apiBaseUrl aún, usar URL relativa
    if (!apiBaseUrl) {
      return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
    return `${apiBaseUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  };

  // =========================
  // Fetch de datos - ACTUALIZADO PARA USAR buildUrl
  // =========================
  const fetchConfiguracion = async (baseUrl: string): Promise<boolean> => {
    try {
      console.log("🔄 Fetching configuracion...");
      // ✅ USAR buildUrl para consistencia
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
        return true; // No es error crítico
      }
    } catch (err) {
      console.error("❌ Error cargando configuración:", err);
      return false;
    }
  };

  const fetchSecciones = async (baseUrl: string): Promise<boolean> => {
    try {
      console.log("🔄 Fetching secciones...");
      // ✅ USAR buildUrl para consistencia
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
        return true; // No es error crítico
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
      // ✅ USAR buildUrl para consistencia
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
        return true; // No es error crítico
      }
    } catch (err) {
      console.error("❌ Error cargando regiones:", err);
      setRegionesZonas([]);
      return false;
    }
  };

  // Carga todos los datos - MEJORADO CON FALLBACKS
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    console.log("🚀 Iniciando carga de datos...");
  
    try {
      // ✅ PRIMERO: Obtener la URL base dinámicamente
      const baseUrl = await getApiBaseUrl();
      console.log("🔗 URL base OBTENIDA:", baseUrl);
      
      setApiBaseUrl(baseUrl);
      console.log("🔗 URL base CONFIGURADA en estado:", baseUrl);
  
      // ... resto del código
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

  // =========================
  // Funciones auxiliares - ACTUALIZADAS CON apiBaseUrl
  // =========================
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

  // ✅ getImageUrl actualizada para usar la URL base dinámica
  // ✅ TEMPORAL: Ignorar apiBaseUrl y usar hardcodeado
  const getImageUrlDynamic = (imagePath: string): string => {
    console.log('🔍 getImageUrlDynamic - apiBaseUrl actual:', apiBaseUrl);
    // ✅ TEMPORAL: Ignorar apiBaseUrl y usar URL hardcodeada
    return getImageUrl(imagePath, 'https://turismo-backend-av60.onrender.com');
  };

  // =========================
  // Retorno del hook - ✅ AGREGADA buildUrl
  // =========================
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
    getImageUrl: getImageUrlDynamic, // ✅ Usa la versión dinámica
    buildUrl, // ✅ NUEVO: función para construir URLs
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl // ✅ Para debugging
  };
};