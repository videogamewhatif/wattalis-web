import type { Area, AreaId, Specialty } from "./types";

/**
 * Áreas de atención. El orden define cómo se presentan en la portada.
 * `systemName` conserva la correspondencia con el catálogo de la aplicación
 * privada; `label` es el nombre que ve el público.
 */
export const AREAS: readonly Area[] = [
  {
    id: "atencion-medica",
    systemName: "Hospital",
    label: "Atención médica",
    description:
      "Consulta médica general y especialidades como pediatría o dermatología.",
    keywords: ["hospital", "medico", "medica", "doctor", "doctora", "consulta", "clinica"],
  },
  {
    id: "nutricion",
    systemName: "Nutriólogo",
    label: "Nutrición",
    description: "Orientación alimentaria, planes de nutrición y seguimiento.",
    keywords: ["nutriologo", "nutriologa", "nutricionista", "dieta", "alimentacion"],
  },
  {
    id: "psicologia",
    systemName: "Psicólogo",
    label: "Psicología",
    description: "Acompañamiento psicológico para personas, parejas y familias.",
    keywords: ["psicologo", "psicologa", "terapia", "terapeuta", "salud mental"],
  },
  {
    id: "odontologia",
    systemName: "Dentista",
    label: "Odontología",
    description: "Salud bucal, limpiezas, tratamientos dentales y ortodoncia.",
    keywords: ["dentista", "dental", "dientes", "muelas", "odontologo", "odontologa"],
  },
  {
    id: "optica",
    systemName: "Óptica",
    label: "Óptica",
    description: "Exámenes de la vista, lentes graduados y lentes de contacto.",
    keywords: ["optica", "optometrista", "lentes", "anteojos", "vista", "graduacion"],
  },
] as const;

/**
 * Catálogo de especialidades. Solo se muestran públicamente las que tienen
 * al menos un perfil publicado. Pertenecer a un área no implica un grado,
 * título o credencial: esos datos los declara cada profesional.
 */
export const SPECIALTIES: readonly Specialty[] = [
  {
    slug: "medicina-general",
    name: "Medicina general",
    areaId: "atencion-medica",
    description:
      "Valoración inicial, seguimiento de padecimientos frecuentes y orientación sobre cuándo acudir con otra especialidad.",
    keywords: ["medico general", "chequeo", "consulta general"],
  },
  {
    slug: "pediatria",
    name: "Pediatría",
    areaId: "atencion-medica",
    description:
      "Atención de la salud de bebés, niñas, niños y adolescentes, incluido el control de crecimiento y desarrollo.",
    keywords: ["pediatra", "ninos", "bebes", "infantil"],
  },
  {
    slug: "dermatologia",
    name: "Dermatología",
    areaId: "atencion-medica",
    description: "Cuidado de la piel, el cabello y las uñas.",
    keywords: ["dermatologo", "dermatologa", "piel", "acne"],
  },
  {
    slug: "nutricion-clinica",
    name: "Nutrición clínica",
    areaId: "nutricion",
    description:
      "Planes de alimentación para acompañar condiciones de salud y cambios de hábitos.",
    keywords: ["diabetes", "colesterol", "control de peso"],
  },
  {
    slug: "nutricion-deportiva",
    name: "Nutrición deportiva",
    areaId: "nutricion",
    description: "Alimentación para personas que entrenan o practican algún deporte.",
    keywords: ["deporte", "rendimiento", "composicion corporal"],
  },
  {
    slug: "psicologia-clinica",
    name: "Psicología clínica",
    areaId: "psicologia",
    description:
      "Evaluación y acompañamiento psicológico para personas adultas.",
    keywords: ["ansiedad", "estres", "depresion", "psicoterapia"],
  },
  {
    slug: "psicologia-infantil",
    name: "Psicología infantil",
    areaId: "psicologia",
    description: "Acompañamiento a niñas, niños y sus familias.",
    keywords: ["ninos", "aprendizaje", "conducta", "crianza"],
  },
  {
    slug: "terapia-de-pareja",
    name: "Terapia de pareja",
    areaId: "psicologia",
    description: "Espacio para trabajar la comunicación y los acuerdos en pareja.",
    keywords: ["pareja", "relaciones", "comunicacion"],
  },
  {
    slug: "odontologia-general",
    name: "Odontología general",
    areaId: "odontologia",
    description: "Revisiones, limpiezas y tratamientos dentales frecuentes.",
    keywords: ["limpieza dental", "caries", "resinas"],
  },
  {
    slug: "odontopediatria",
    name: "Odontopediatría",
    areaId: "odontologia",
    description: "Salud bucal de niñas y niños.",
    keywords: ["dentista infantil", "ninos"],
  },
  {
    slug: "ortodoncia",
    name: "Ortodoncia",
    areaId: "odontologia",
    description: "Corrección de la posición de los dientes y la mordida.",
    keywords: ["brackets", "alineadores", "frenos"],
  },
  {
    slug: "optometria",
    name: "Optometría",
    areaId: "optica",
    description: "Examen de la vista y graduación de lentes.",
    keywords: ["examen de la vista", "graduacion", "lentes"],
  },
  {
    slug: "lentes-de-contacto",
    name: "Lentes de contacto",
    areaId: "optica",
    description: "Adaptación y seguimiento de lentes de contacto.",
    keywords: ["pupilentes", "contactologia"],
  },
] as const;

/**
 * Alias de ubicaciones que el público escribe con frecuencia. La clave se
 * compara normalizada contra ciudad o estado.
 */
export const LOCATION_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "ciudad de mexico": ["cdmx", "df", "d.f.", "mexico df"],
  guadalajara: ["gdl", "zona metropolitana de guadalajara"],
  monterrey: ["mty", "zona metropolitana de monterrey"],
  "nuevo leon": ["nl"],
};

export function getArea(id: string): Area | undefined {
  return AREAS.find((area) => area.id === id);
}

export function getSpecialty(slug: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.slug === slug);
}

export function specialtiesForArea(areaId: AreaId): Specialty[] {
  return SPECIALTIES.filter((s) => s.areaId === areaId);
}

/** Variable CSS del color de acento de cada área. */
export const AREA_COLOR_VAR: Record<AreaId, string> = {
  "atencion-medica": "var(--area-hospital)",
  nutricion: "var(--area-nutricion)",
  psicologia: "var(--area-psicologia)",
  odontologia: "var(--area-odontologia)",
  optica: "var(--area-optica)",
};
