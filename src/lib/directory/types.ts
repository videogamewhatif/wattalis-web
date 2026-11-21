/**
 * Modelo de datos públicos del directorio Wattalis.
 *
 * Solo contiene campos que una clínica aprueba para publicar. Nunca debe
 * incluir pacientes, citas, cobros, horarios operativos de agenda, notas
 * internas ni credenciales de acceso.
 */

/** Identificador público del área. Se corresponde con el catálogo privado. */
export type AreaId =
  | "atencion-medica"
  | "nutricion"
  | "psicologia"
  | "odontologia"
  | "optica";

/** Nombre del área tal como existe en la aplicación privada. */
export type SystemAreaName =
  | "Hospital"
  | "Nutriólogo"
  | "Psicólogo"
  | "Dentista"
  | "Óptica";

export interface Area {
  id: AreaId;
  /** Nombre en el catálogo de la aplicación privada. */
  systemName: SystemAreaName;
  /** Etiqueta visible para el público. */
  label: string;
  description: string;
  /** Términos con los que el público suele buscar esta área. */
  keywords: string[];
}

export interface Specialty {
  slug: string;
  name: string;
  areaId: AreaId;
  description: string;
  keywords: string[];
}

/** Día de la semana según ISO 8601: 1 = lunes … 7 = domingo. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Horario informativo de atención de una sede. No representa disponibilidad. */
export interface PublicOfficeHours {
  locationId: string;
  day: Weekday;
  /** Formato 24 h, HH:MM. */
  opens: string;
  closes: string;
}

export interface PublicLocation {
  id: string;
  name: string;
  /** Calle y número publicables. */
  street?: string;
  /** Colonia o zona. */
  neighborhood?: string;
  /** Municipio o alcaldía. */
  municipality: string;
  city: string;
  state: string;
  postalCode?: string;
  /** Referencia breve para llegar, por ejemplo «Frente al parque». */
  reference?: string;
  /** Teléfono público del consultorio. */
  phone?: string;
  /** Correo público autorizado por el consultorio. */
  email?: string;
}

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  /** Monto público en MXN. Si no existe, el servicio se muestra sin precio. */
  priceMXN?: number;
  /** Sedes donde se ofrece este servicio con estos datos. */
  locationIds: string[];
}

export interface PublicPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Indica que la imagen es ilustrativa y no un retrato real. */
  illustrative: boolean;
}

export type PublicationStatus = "published" | "draft" | "withdrawn";

export interface PublicProfessional {
  id: string;
  slug: string;
  /**
   * La fuente de datos debe filtrar por estado. El campo se conserva para que
   * cada proveedor aplique el filtro también en la lectura por slug.
   */
  status: PublicationStatus;
  /** Perfil ficticio de demostración: sin indexación ni acciones de contacto. */
  isDemo: boolean;
  /** Nombre público, por ejemplo «Ana Lucía Ríos Peralta». */
  publicName: string;
  /** Clave de orden alfabético (apellido, nombre). */
  sortName: string;
  /** Título profesional declarado por la persona, por ejemplo «Psicóloga». */
  professionalTitle?: string;
  areaId: AreaId;
  /** Especialidades publicadas, en orden de relevancia. */
  specialtySlugs: string[];
  /** Resumen de una línea para tarjetas y metadatos. */
  summary?: string;
  bio?: string;
  experience?: string[];
  education?: string[];
  languages?: string[];
  /** Cédula profesional publicada voluntariamente. No activa distintivos. */
  licenseNumber?: string;
  photo?: PublicPhoto;
  locations: PublicLocation[];
  services: PublicService[];
  officeHours: PublicOfficeHours[];
}
