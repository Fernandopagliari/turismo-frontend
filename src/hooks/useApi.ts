import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ CORREGIDO: Usar la misma URL para desarrollo y producción
const API_BASE = 'https://turismo-regional.up.railway.app';

// ✅ FUNCIÓN getImageUrl CORREGIDA - Usar /static-assets/ en lugar de /assets/
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  console.log('🖼️ getImageUrl INPUT:', imagePath);
  
  // Si ya es URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ getImageUrl YA CORRECTA:', imagePath);
    return imagePath;
  }
  
  // Si es ruta absoluta de Windows (como las de tu BD)
  if (imagePath.includes('E:/Sistemas')) {
    // Extraer solo el nombre del archivo y construir ruta relativa
    const nombreArchivo = imagePath.split('/').pop() || imagePath.split('\\').pop();
    // ✅ CORREGIDO: Usar /static-assets/
    const url = `${API_BASE}/static-assets/imagenes/${nombreArchivo}`;
    console.log('🔄 getImageUrl ABSOLUTA → RELATIVA:', url);
    return url;
  }
  
  // Si es ruta relativa que empieza con "assets/"
  if (imagePath.startsWith('assets/')) {
    // ✅ CORREGIDO: Usar /static-assets/ y quitar el prefijo "assets/"
    const url = `${API_BASE}/static-assets/${imagePath.replace('assets/', '')}`;
    console.log('📁 getImageUrl RELATIVA →', url);
    return url;
  }
  
  // Cualquier otro caso
  // ✅ CORREGIDO: Usar /static-assets/
  const url = `${API_BASE}/static-assets/${imagePath}`;
  console.log('📦 getImageUrl DEFAULT →', url);
  return url;
};

export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [subSecciones, setSubSecciones] = useState<SubSeccion[]>([]); // NUEVO
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORREGIDO: Fetch configuración con ruta correcta
  const fetchConfiguracion = async () => {
    try {
      console.log("🔄 Fetching configuración...");
      const response = await fetch(`${API_BASE}/api/configuracion`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Configuración recibida:", data);
      
      // ✅ CORREGIDO: La API devuelve el objeto directamente, no un array
      if (data && Object.keys(data).length > 0) {
        setConfiguracion(data);
      } else {
        setError('No hay configuración disponible');
      }
    } catch (err) {
      console.error("❌ Error cargando configuración:", err);
      setError('Error cargando configuración');
    }
  };

  // ✅ CORREGIDO: Fetch secciones
  const fetchSecciones = async () => {
    try {
      console.log("🔄 Fetching secciones...");
      const response = await fetch(`${API_BASE}/api/secciones`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Secciones recibidas:", data.length);
      setSecciones(data);
    } catch (err) {
      console.error("❌ Error cargando secciones:", err);
      setError('Error cargando secciones');
    }
  };

  // ✅ NUEVO: Fetch sub-secciones
  const fetchSubSecciones = async () => {
    try {
      console.log("🔄 Fetching sub-secciones...");
      const response = await fetch(`${API_BASE}/api/sub-secciones`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Sub-secciones recibidas:", data.length);
      setSubSecciones(data);
    } catch (err) {
      console.error("❌ Error cargando sub-secciones:", err);
      // No marcamos error porque podría no ser crítico
    }
  };

  // ✅ CORREGIDO: Fetch regiones/zonas
  const fetchRegionesZonas = async () => {
    try {
      console.log("🔄 Fetching regiones...");
      const response = await fetch(`${API_BASE}/api/regiones`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Regiones recibidas:", data.length);
      setRegionesZonas(data);
    } catch (err) {
      console.error("❌ Error cargando regiones:", err);
      setError('Error cargando regiones/zonas');
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchConfiguracion(), 
        fetchSecciones(), 
        fetchSubSecciones(), // NUEVO
        fetchRegionesZonas()
      ]);
    } catch (err) {
      console.error("❌ Error en carga de datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ✅ CORREGIDO: Helper functions actualizadas
  const getSeccionesHabilitadas = (): Seccion[] => {
    return secciones
      .filter(seccion => seccion.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ NUEVO: Obtener subsecciones para una sección específica
  const getSubSeccionesPorSeccion = (idSeccion: number): SubSeccion[] => {
    return subSecciones
      .filter(sub => sub.id_seccion === idSeccion && sub.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ ACTUALIZADO: Secciones completas con sus subsecciones
  const getSeccionesCompletasOrdenadas = (): Seccion[] => {
    return getSeccionesHabilitadas().map(seccion => ({
      ...seccion,
      subsecciones: getSubSeccionesPorSeccion(seccion.id_seccion)
    }));
  };

  // ✅ ACTUALIZADO: Buscar lugares en subsecciones
  const buscarLugares = (termino: string): SubSeccion[] => {
    return subSecciones
      .filter(sub => 
        sub.habilitar === 1 &&
        sub.nombre_sub_seccion.toLowerCase().includes(termino.toLowerCase())
      )
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ ACTUALIZADO: Lugares destacados
  const getLugaresDestacados = (): SubSeccion[] => {
    return subSecciones
      .filter(sub => sub.destacado === 1 && sub.habilitar === 1)
      .sort((a, b) => a.orden - b.orden)
      .slice(0, 8);
  };

  // ✅ ACTUALIZADO: Regiones/Zonas habilitadas
  const getRegionesZonasHabilitadas = (): RegionZona[] => {
    return regionesZonas
      .filter(region => region.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ ACTUALIZADO: Subsecciones por región/zona
  const getSubSeccionesPorRegionZona = (regionZonaId: number | null): SubSeccion[] => {
    if (!regionZonaId) {
      return subSecciones
        .filter(sub => sub.habilitar === 1)
        .sort((a, b) => a.orden - b.orden);
    }
    
    return subSecciones
      .filter(sub => sub.habilitar === 1 && sub.id_region_zona === regionZonaId)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ ACTUALIZADO: Secciones por región/zona
  const getSeccionesPorRegionZona = (regionZonaId: number | null): Seccion[] => {
    const subSeccionesFiltradas = getSubSeccionesPorRegionZona(regionZonaId);
    const seccionesIds = [...new Set(subSeccionesFiltradas.map(sub => sub.id_seccion))];
    
    return getSeccionesHabilitadas()
      .filter(seccion => seccionesIds.includes(seccion.id_seccion))
      .map(seccion => ({
        ...seccion,
        subsecciones: subSeccionesFiltradas.filter(sub => sub.id_seccion === seccion.id_seccion)
      }));
  };

  return {
    configuracion,
    secciones,
    subSecciones, // NUEVO
    regionesZonas,
    seccionesHabilitadas: getSeccionesHabilitadas(),
    regionesZonasHabilitadas: getRegionesZonasHabilitadas(),
    seccionesCompletasOrdenadas: getSeccionesCompletasOrdenadas(),
    lugaresDestacados: getLugaresDestacados(),
    getSubSeccionesHabilitadas: getSubSeccionesPorSeccion, // ACTUALIZADO
    buscarLugares,
    getSubSeccionesPorRegionZona,
    getSeccionesPorRegionZona,
    getImageUrl,
    loading,
    error,
    refetch: cargarDatos
  };
};