import { useState, useEffect } from 'react';
import { Configuracion, Seccion, SubSeccion, RegionZona } from '../types/tourism';

// ✅ UNIVERSAL: Detectar la URL base automáticamente
const getApiBase = (): string => {
  // En desarrollo: usar localhost, en producción: la URL actual
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  return window.location.origin;
};

const API_BASE = getApiBase();

// ✅ FUNCIÓN getImageUrl UNIVERSAL
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
    const nombreArchivo = imagePath.split('/').pop() || imagePath.split('\\').pop();
    const url = `${API_BASE}/static-assets/imagenes/${nombreArchivo}`;
    console.log('🔄 getImageUrl ABSOLUTA → RELATIVA:', url);
    return url;
  }
  
  // Si es ruta relativa que empieza con "assets/"
  if (imagePath.startsWith('assets/')) {
    const url = `${API_BASE}/static-assets/${imagePath.replace('assets/', '')}`;
    console.log('📁 getImageUrl RELATIVA →', url);
    return url;
  }
  
  // Cualquier otro caso
  const url = `${API_BASE}/static-assets/${imagePath}`;
  console.log('📦 getImageUrl DEFAULT →', url);
  return url;
};

export const useApi = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ OBTENER TODAS LAS SUB_SECCIONES DE LAS SECCIONES (CON SEGURIDAD)
  const getAllSubSecciones = (): SubSeccion[] => {
    return secciones.flatMap(seccion => seccion.subsecciones || []);
  };

  // ✅ Fetch configuración
  const fetchConfiguracion = async () => {
    try {
      console.log("🔄 Fetching configuración...");
      const response = await fetch(`${API_BASE}/api/configuracion`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Configuración recibida:", data);
      
      if (data && Object.keys(data).length > 0) {
        setConfiguracion(data);
      } else {
        console.warn("⚠️ No hay configuración disponible");
      }
    } catch (err) {
      console.error("❌ Error cargando configuración:", err);
      setError('Error cargando configuración');
    }
  };

  // ✅ MODIFICADO: Combinar secciones + sub-secciones manualmente
  const fetchSecciones = async () => {
    try {
      console.log("🔄 Combinando secciones y sub-secciones...");
      
      // ✅ LLAMADA 1: Obtener secciones básicas
      const responseSecciones = await fetch(`${API_BASE}/api/secciones`);
      if (!responseSecciones.ok) throw new Error(`Error HTTP: ${responseSecciones.status}`);
      const seccionesBasic: Seccion[] = await responseSecciones.json();
      
      // ✅ LLAMADA 2: Obtener TODAS las subsecciones  
      const responseSubSecciones = await fetch(`${API_BASE}/api/sub-secciones`);
      if (!responseSubSecciones.ok) throw new Error(`Error HTTP: ${responseSubSecciones.status}`);
      const todasSubSecciones: SubSeccion[] = await responseSubSecciones.json();
      
      // ✅ COMBINAR MANUALMENTE: Agregar subsecciones a cada sección
      const seccionesCompletas = seccionesBasic.map(seccion => ({
        ...seccion,
        subsecciones: todasSubSecciones.filter(sub => 
          sub.id_seccion === seccion.id_seccion && sub.habilitar === 1
        ).sort((a, b) => a.orden - b.orden)
      }));
      
      console.log("✅ Secciones combinadas:", {
        secciones: seccionesCompletas.length,
        subseccionesTotales: todasSubSecciones.length,
        subseccionesFiltradas: seccionesCompletas.reduce((total, sec) => total + sec.subsecciones.length, 0)
      });
      
      // ✅ VERIFICAR FOTOS ADICIONALES
      if (seccionesCompletas.length > 0 && seccionesCompletas[0].subsecciones.length > 0) {
        const primeraSubseccion = seccionesCompletas[0].subsecciones[0];
        console.log("📸 Primera subsección - Fotos disponibles:", {
          nombre: primeraSubseccion.nombre_sub_seccion,
          imagen_principal: primeraSubseccion.imagen_ruta_relativa,
          foto1: primeraSubseccion.foto1_ruta_relativa,
          foto2: primeraSubseccion.foto2_ruta_relativa,
          foto3: primeraSubseccion.foto3_ruta_relativa,
          foto4: primeraSubseccion.foto4_ruta_relativa
        });
      }
      
      setSecciones(seccionesCompletas);
    } catch (err) {
      console.error("❌ Error combinando secciones:", err);
      setError('Error cargando secciones');
    }
  };

  // ✅ Fetch regiones/zonas
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
      // ✅ SOLO 3 LLAMADAS optimizadas
      await Promise.all([
        fetchConfiguracion(), 
        fetchSecciones(),      // ✅ Ahora combina secciones + subsecciones
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

  // ✅ HELPER FUNCTIONS OPTIMIZADAS (CON SEGURIDAD)
  const getSeccionesHabilitadas = (): Seccion[] => {
    return secciones
      .filter(seccion => seccion.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ Obtener todas las subsecciones habilitadas
  const getAllSubSeccionesHabilitadas = (): SubSeccion[] => {
    return getAllSubSecciones()
      .filter(sub => sub.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ Secciones completas con sus subsecciones
  const getSeccionesCompletasOrdenadas = (): Seccion[] => {
    return getSeccionesHabilitadas();
  };

  // ✅ Buscar lugares en subsecciones
  const buscarLugares = (termino: string): SubSeccion[] => {
    return getAllSubSeccionesHabilitadas()
      .filter(sub => 
        sub.nombre_sub_seccion.toLowerCase().includes(termino.toLowerCase())
      );
  };

  // ✅ Lugares destacados
  const getLugaresDestacados = (): SubSeccion[] => {
    return getAllSubSeccionesHabilitadas()
      .filter(sub => sub.destacado === 1)
      .slice(0, 8);
  };

  // ✅ Regiones/Zonas habilitadas
  const getRegionesZonasHabilitadas = (): RegionZona[] => {
    return regionesZonas
      .filter(region => region.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);
  };

  // ✅ Subsecciones por región/zona
  const getSubSeccionesPorRegionZona = (regionZonaId: number | null): SubSeccion[] => {
    const todasSubSecciones = getAllSubSeccionesHabilitadas();
    
    if (!regionZonaId) {
      return todasSubSecciones;
    }
    
    return todasSubSecciones
      .filter(sub => sub.id_region_zona === regionZonaId);
  };

  // ✅ Secciones por región/zona
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

  // ✅ Obtener subsecciones para una sección específica
  const getSubSeccionesPorSeccion = (idSeccion: number): SubSeccion[] => {
    const seccion = secciones.find(s => s.id_seccion === idSeccion);
    return seccion?.subsecciones?.filter(sub => sub.habilitar === 1) || [];
  };

  return {
    configuracion,
    secciones,
    subSecciones: getAllSubSeccionesHabilitadas(), // ✅ Para compatibilidad
    regionesZonas,
    seccionesHabilitadas: getSeccionesHabilitadas(),
    regionesZonasHabilitadas: getRegionesZonasHabilitadas(),
    seccionesCompletasOrdenadas: getSeccionesCompletasOrdenadas(),
    lugaresDestacados: getLugaresDestacados(),
    getSubSeccionesHabilitadas: getSubSeccionesPorSeccion,
    buscarLugares,
    getSubSeccionesPorRegionZona,
    getSeccionesPorRegionZona,
    getImageUrl,
    loading,
    error,
    refetch: cargarDatos
  };
};