import { useState, useEffect } from "react";
import {
  Configuracion,
  Seccion,
  SubSeccion,
  RegionZona
} from "../types/tourism";

/* =====================================================
   API BASE — AUTO ENTORNO + ENV
   ===================================================== */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://turismo-backend-av60.onrender.com");

/* =====================================================
   FETCH HELPER
   ===================================================== */

const apiFetch = async (endpoint: string) => {
  const res = await fetch(`${API_BASE}${endpoint}`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

/* =====================================================
   HOOK PRINCIPAL
   ===================================================== */

export const useApi = () => {
  const [configuracion, setConfiguracion] =
    useState<Configuracion | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [regionesZonas, setRegionesZonas] = useState<RegionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     UTILIDAD: validar subsección activa
     ===================================================== */

  const isSubSeccionActiva = (sub: SubSeccion): boolean => {
    if (sub.habilitar !== 1) return false;

    if (sub.fecha_desactivacion) {
      const hoy = new Date();
      const fin = new Date(sub.fecha_desactivacion);
      if (hoy > fin) return false;
    }

    return true;
  };

  /* =====================================================
     FETCHS
     ===================================================== */

  const fetchConfiguracion = async () => {
    try {
      const data: Configuracion =
        await apiFetch("/api/configuracion");
      setConfiguracion(data);
    } catch (err) {
      console.error(err);
      setError("Error cargando configuración");
    }
  };

  const fetchSecciones = async () => {
    try {
      const data = await apiFetch("/api/secciones");
      setSecciones(data || []);
    } catch {
      throw new Error("Secciones no disponibles");
    }
  };

  const fetchRegionesZonas = async () => {
    try {
      const data = await apiFetch("/api/regiones");
      setRegionesZonas(data || []);
    } catch {
      throw new Error("Regiones/Zonas no disponibles");
    }
  };

  /* =====================================================
     CARGA GENERAL
     ===================================================== */

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchConfiguracion(),
        fetchSecciones(),
        fetchRegionesZonas()
      ]);
    } catch (err) {
      console.error(err);
      setError("Error cargando datos de la aplicación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /* =====================================================
     HELPERS
     ===================================================== */

  const getSeccionesHabilitadas = (): Seccion[] =>
    secciones
      .filter(s => s.habilitar === 1)
      .sort((a, b) => a.orden - b.orden)
      .map(s => ({
        ...s,
        subsecciones: (s.subsecciones || [])
          .filter(isSubSeccionActiva)
          .sort((a, b) => a.orden - b.orden)
      }));

  const buscarLugares = async (
    termino: string
  ): Promise<SubSeccion[]> => {
    if (!termino.trim()) return [];

    return secciones.flatMap(s =>
      (s.subsecciones || []).filter(
        sub =>
          isSubSeccionActiva(sub) &&
          sub.nombre_sub_seccion
            .toLowerCase()
            .includes(termino.toLowerCase())
      )
    );
  };

  const getLugaresDestacados = (): SubSeccion[] =>
    secciones
      .flatMap(s => s.subsecciones || [])
      .filter(sub => sub.destacado === 1 && isSubSeccionActiva(sub))
      .sort((a, b) => a.orden - b.orden)
      .slice(0, 8);

  const getRegionesZonasHabilitadas = (): RegionZona[] =>
    regionesZonas
      .filter(r => r.habilitar === 1)
      .sort((a, b) => a.orden - b.orden);

  const getSeccionesPorRegionZona = (
    regionZonaId: number | null
  ): Seccion[] =>
    getSeccionesHabilitadas()
      .map(s => ({
        ...s,
        subsecciones: s.subsecciones.filter(
          sub => !regionZonaId || sub.id_region_zona === regionZonaId
        )
      }))
      .filter(s => s.subsecciones.length > 0);

  const darLike = async (id: number): Promise<number> => {
    const res = await fetch(
      `${API_BASE}/api/subsecciones/${id}/like`,
      { method: "POST" }
    );

    if (!res.ok) throw new Error("Error like");

    const data = await res.json();
    return data.likes;
  };


  /* =====================================================
     RETURN
     ===================================================== */

  return {
    configuracion,
    seccionesHabilitadas: getSeccionesHabilitadas(),
    regionesZonasHabilitadas: getRegionesZonasHabilitadas(),
    lugaresDestacados: getLugaresDestacados(),
    buscarLugares,
    getSeccionesPorRegionZona,
    loading,
    error,
    refetch: cargarDatos,
    darLike
  };
};

/* =====================================================
   IMÁGENES — FLASK COMPATIBLE
   ===================================================== */

export const getImageUrl = (ruta?: string | null): string => {
  if (!ruta) return "/placeholder.jpg";

  if (ruta.startsWith("http")) return ruta;

  return `${API_BASE}${ruta.startsWith("/") ? ruta : "/" + ruta}`;
};
