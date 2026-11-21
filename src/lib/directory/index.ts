/**
 * Interfaz única de lectura del directorio. Páginas y componentes importan
 * desde aquí y nunca directamente desde un proveedor.
 */
import { cache } from "react";
import { AREAS, SPECIALTIES, getArea, getSpecialty } from "./catalog";
import { normalizeText } from "./normalize";
import type { DirectoryProvider } from "./provider";
import { createDemoProvider } from "./providers/demo";
import { compareAlphabetical, searchProfessionals, type DirectoryQuery } from "./search";
import type { Area, PublicProfessional, Specialty } from "./types";

export type { DirectoryQuery, SearchResult, FacetOption, SortOrder } from "./search";
export { parseDirectoryQuery, toSearchString, hasTextQuery, PAGE_SIZE } from "./search";
export * from "./types";
export { AREAS, getArea, getSpecialty, AREA_COLOR_VAR } from "./catalog";

function createProvider(): DirectoryProvider {
  const source = process.env.WATTALIS_DATA_SOURCE ?? "demo";
  switch (source) {
    case "demo":
      return createDemoProvider();
    // Para conectar el directorio real, agrega aquí el proveedor autorizado,
    // por ejemplo: case "public-api": return createPublicApiProvider();
    // Consulta «Sustituir la fuente de datos» en el README.
    default:
      throw new Error(
        `WATTALIS_DATA_SOURCE="${source}" no tiene un proveedor configurado. Usa "demo" o registra el proveedor en src/lib/directory/index.ts.`,
      );
  }
}

let provider: DirectoryProvider | undefined;
function getProvider(): DirectoryProvider {
  provider ??= createProvider();
  return provider;
}

/** Defensa adicional: descarta cualquier perfil no publicado que llegue de la fuente. */
const isPublished = (p: PublicProfessional) => p.status === "published";

export const listProfessionals = cache(async (): Promise<PublicProfessional[]> => {
  const list = await getProvider().listPublishedProfessionals();
  return list.filter(isPublished).sort(compareAlphabetical);
});

export const getProfessional = cache(async (slug: string): Promise<PublicProfessional | null> => {
  const p = await getProvider().getPublishedProfessionalBySlug(slug);
  return p && isPublished(p) ? p : null;
});

export async function searchDirectory(query: DirectoryQuery) {
  const p = getProvider();
  if (p.search) return p.search(query);
  return searchProfessionals(await listProfessionals(), query);
}

/** Hay perfiles de demostración en el catálogo actual. */
export async function hasDemoProfiles(): Promise<boolean> {
  return (await listProfessionals()).some((p) => p.isDemo);
}

/** Selección breve con variedad de áreas para la portada. */
export async function getFeaturedProfessionals(limit = 4): Promise<PublicProfessional[]> {
  const list = await listProfessionals();
  const picked: PublicProfessional[] = [];
  for (const area of AREAS) {
    const candidate = list.find((p) => p.areaId === area.id && p.bio);
    if (candidate) picked.push(candidate);
    if (picked.length === limit) break;
  }
  return picked;
}

export interface SpecialtyWithCount extends Specialty {
  count: number;
}

export interface AreaGroup {
  area: Area;
  count: number;
  specialties: SpecialtyWithCount[];
}

/** Áreas y especialidades que tienen al menos un perfil publicado. */
export const getPublishedCatalog = cache(async (): Promise<AreaGroup[]> => {
  const list = await listProfessionals();
  return AREAS.map((area) => {
    const inArea = list.filter((p) => p.areaId === area.id);
    const specialties = SPECIALTIES.filter((s) => s.areaId === area.id)
      .map((s) => ({ ...s, count: inArea.filter((p) => p.specialtySlugs.includes(s.slug)).length }))
      .filter((s) => s.count > 0);
    return { area, count: inArea.length, specialties };
  }).filter((group) => group.count > 0);
});

export async function getSpecialtyPage(slug: string) {
  const specialty = getSpecialty(slug);
  if (!specialty) return null;
  const professionals = (await listProfessionals()).filter((p) =>
    p.specialtySlugs.includes(slug),
  );
  if (professionals.length === 0) return null;
  const area = getArea(specialty.areaId)!;
  return { specialty, area, professionals };
}

export interface Suggestion {
  label: string;
  hint: string;
}

/** Sugerencias para el buscador, construidas solo con datos publicados. */
export const getSuggestionCatalog = cache(async () => {
  const catalog = await getPublishedCatalog();
  const terms: Suggestion[] = [
    ...catalog.map((g) => ({ label: g.area.label, hint: "Área" })),
    ...catalog.flatMap((g) => g.specialties.map((s) => ({ label: s.name, hint: "Especialidad" }))),
  ];
  const seen = new Set<string>();
  const places: Suggestion[] = [];
  const add = (label: string | undefined, hint: string) => {
    if (!label) return;
    const key = normalizeText(label);
    if (seen.has(key)) return;
    seen.add(key);
    places.push({ label, hint });
  };
  const list = await listProfessionals();
  for (const p of list) for (const l of p.locations) add(l.city, l.state === l.city ? "Ciudad" : `Ciudad · ${l.state}`);
  for (const p of list) for (const l of p.locations) add(l.municipality, `Municipio o alcaldía · ${l.city}`);
  for (const p of list) for (const l of p.locations) add(l.neighborhood, "Colonia o zona");
  return { terms, places };
});
