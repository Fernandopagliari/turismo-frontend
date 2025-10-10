export interface Configuracion {
  id_config: number;
  titulo_app: string;
  logo_app_ruta_relativa: string;
  icono_hamburguesa_ruta_relativa: string;
  icono_cerrar_ruta_relativa: string;
  hero_titulo: string;
  hero_imagen_ruta_relativa: string;
  footer_texto: string;
  direccion_facebook: string;
  direccion_instagram: string;
  direccion_twitter: string;
  direccion_youtube: string;
  correo_electronico: string;
  habilitar: number;
}

export interface SubSeccion {
  id_sub_seccion: number;
  id_seccion: number;
  id_region_zona: number;
  nombre_sub_seccion: string;
  domicilio: string;
  latitud: number;
  longitud: number;
  distancia: number;
  numero_telefono: string;
  imagen_ruta_relativa: string;
  icono_ruta_relativa: string;
  itinerario_maps: string;
  habilitar: number;
  fecha_desactivacion: string | null;
  orden: number;
  destacado: number;  
  foto1_ruta_relativa: string;
  foto2_ruta_relativa: string;
  foto3_ruta_relativa: string;
  foto4_ruta_relativa: string;
}

export interface Seccion {
  id_seccion: number;
  nombre_seccion: string;
  icono_seccion: string;
  habilitar: number; 
  orden: number;
  subsecciones: SubSeccion[];
}

export interface RegionZona {
  id_region_zona: number;
  nombre_region_zona: string;
  imagen_region_zona_ruta_relativa: string;
  habilitar: number; 
  orden: number;
}