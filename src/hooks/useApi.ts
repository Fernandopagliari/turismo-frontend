// useApi.tsx - VERSIÓN SUPER SIMPLIFICADA
import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ URL BASE FIJA PERO CON FUNCIÓN DIRECTA
const API_BASE_URL = 'https://turismo-backend-av60.onrender.com';

// ✅ getImageUrl DIRECTA - sin parámetros, sin lógica compleja
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  console.log('🖼️ getImageUrl DIRECTA - input:', imagePath);
  
  // Si ya es URL completa, devolver tal cual
  if (imagePath.startsWith('http')) return imagePath;
  
  // ✅ CONSTRUIR URL DIRECTAMENTE
  let finalUrl = '';
  
  if (imagePath.startsWith('assets/')) {
    finalUrl = `${API_BASE_URL}/${imagePath}`;
  } else if (imagePath.startsWith('/')) {
    finalUrl = `${API_BASE_URL}${imagePath}`;
  } else {
    finalUrl = `${API_BASE_URL}/assets/${imagePath}`;
  }
  
  console.log('🖼️ getImageUrl DIRECTA - output:', finalUrl);
  return finalUrl;
};

export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ buildUrl DIRECTA
  const buildUrl = (endpoint: string): string => {
    return `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  };

  // Fetch functions (mantener igual)
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
      const [configSuccess, seccionesSuccess, regionesSuccess] = await Promise.all([
        fetchConfiguracion(),
        fetchSecciones(),
        fetchRegionesZonas()
      ]);

      console.log(`📊 Carga completada: ${[configSuccess, seccionesSuccess, regionesSuccess].filter(Boolean).length}/3 exitosos`);
    } catch (err) {
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ✅ getImageUrlDirect - simplemente devolver la función importada
  const getImageUrlDirect = getImageUrl;

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
    getImageUrl: getImageUrlDirect, // ← FUNCIÓN DIRECTA
    buildUrl,
    loading,
    error,
    refetch: cargarDatos,
    apiBaseUrl: API_BASE_URL
  };
};