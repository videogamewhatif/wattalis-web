import { AREAS, LOCATION_ALIASES, getArea, getSpecialty } from "./catalog";
import { matchToken, normalizeText, slugify, tokenize } from "./normalize";
import type { AreaId, PublicLocation, PublicProfessional } from "./types";

export const PAGE_SIZE = 6;

export type SortOrder = "relevancia" | "alfabetico";

/** Estado completo de una búsqueda. Se representa íntegro en la URL. */
export interface DirectoryQuery {
  q: string;
  ubicacion: string;
  area?: AreaId;
  especialidad?: string;
  ciudad?: string;
  orden: SortOrder;
  pagina: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const MAX_TEXT_LENGTH = 80;

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);
}

export function hasTextQuery(query: Pick<DirectoryQuery, "q" | "ubicacion">): boolean {
  return query.q.length > 0 || query.ubicacion.length > 0;
}

/** Interpreta los parámetros de la URL e ignora valores desconocidos. */
export function parseDirectoryQuery(raw: RawSearchParams): DirectoryQuery {
  const q = first(raw.q);
  const ubicacion = first(raw.ubicacion);
  const areaValue = first(raw.area);
  const area = getArea(areaValue)?.id;
  const especialidadValue = first(raw.especialidad);
  const especialidad = getSpecialty(especialidadValue)?.slug;
  const ciudadValue = slugify(first(raw.ciudad));
  const ciudad = ciudadValue || undefined;
  const ordenValue = first(raw.orden);
  const textual = hasTextQuery({ q, ubicacion });
  const orden: SortOrder =
    ordenValue === "alfabetico" || !textual ? "alfabetico" : "relevancia";
  const page = Number.parseInt(first(raw.pagina), 10);
  const pagina = Number.isFinite(page) && page > 0 ? page : 1;
  return { q, ubicacion, area, especialidad, ciudad, orden, pagina };
}

/**
 * Serializa una búsqueda. Omite valores por defecto para que las URL
 * sean cortas y estables. Cambiar cualquier criterio reinicia la página
 * salvo que se indique `pagina` explícitamente.
 */
export function toSearchString(
  query: DirectoryQuery,
  changes: Partial<Record<keyof DirectoryQuery, string | number | undefined>> = {},
): string {
  const next: Record<string, string | number | undefined> = { ...query, ...changes };
  if (!("pagina" in changes)) next.pagina = 1;
  const textual = hasTextQuery({
    q: String(next.q ?? ""),
    ubicacion: String(next.ubicacion ?? ""),
  });
  const params = new URLSearchParams();
  for (const key of ["q", "ubicacion", "area", "especialidad", "ciudad"] as const) {
    const value = next[key];
    if (value !== undefined && String(value).trim() !== "") params.set(key, String(value));
  }
  if (textual && next.orden === "alfabetico") params.set("orden", "alfabetico");
  if (Number(next.pagina) > 1) params.set("pagina", String(next.pagina));
  const s = params.toString();
  return s ? `?${s}` : "";
}

/* ------------------------------------------------------------------ */
/* Índice de búsqueda                                                  */
/* ------------------------------------------------------------------ */

interface WeightedField {
  weight: number;
  tokens: string[];
}

interface IndexedProfessional {
  professional: PublicProfessional;
  fields: WeightedField[];
  phrases: string[];
  locations: { location: PublicLocation; citySlug: string; tokens: string[] }[];
}

function aliasesFor(...values: string[]): string[] {
  return values.flatMap((value) => LOCATION_ALIASES[normalizeText(value)] ?? []);
}

function indexProfessional(p: PublicProfessional): IndexedProfessional {
  const area = getArea(p.areaId);
  const specialties = p.specialtySlugs.flatMap((slug) => getSpecialty(slug) ?? []);
  const field = (weight: number, ...values: (string | undefined)[]): WeightedField => ({
    weight,
    tokens: values.flatMap((v) => (v ? tokenize(v) : [])),
  });
  return {
    professional: p,
    fields: [
      field(6, p.publicName),
      field(5, ...specialties.map((s) => s.name)),
      field(4, p.professionalTitle, area?.label, area?.systemName),
      field(3, ...p.services.map((s) => s.name)),
      field(2, ...specialties.flatMap((s) => s.keywords), ...(area?.keywords ?? [])),
      field(1, p.summary, ...p.services.map((s) => s.description)),
    ],
    phrases: [p.publicName, ...specialties.map((s) => s.name)].map(normalizeText),
    locations: p.locations.map((location) => ({
      location,
      citySlug: slugify(location.city),
      tokens: [
        location.neighborhood,
        location.municipality,
        location.city,
        location.state,
        location.postalCode,
        ...aliasesFor(location.city, location.state),
      ].flatMap((v) => (v ? tokenize(v) : [])),
    })),
  };
}

/** Puntúa la búsqueda por texto. `null` significa que no coincide. */
function scoreText(entry: IndexedProfessional, q: string): number | null {
  const tokens = tokenize(q);
  if (tokens.length === 0) return 0;
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const f of entry.fields) best = Math.max(best, f.weight * matchToken(token, f.tokens));
    if (best === 0) return null;
    total += best;
  }
  const phrase = normalizeText(q);
  if (entry.phrases.some((p) => p.includes(phrase))) total += 5;
  return total;
}

/** Todas las palabras de ubicación deben coincidir con una misma sede. */
function scoreLocation(entry: IndexedProfessional, ubicacion: string): number | null {
  const tokens = tokenize(ubicacion);
  if (tokens.length === 0) return 0;
  let best: number | null = null;
  for (const loc of entry.locations) {
    let total = 0;
    let ok = true;
    for (const token of tokens) {
      const m = matchToken(token, loc.tokens);
      if (m === 0) {
        ok = false;
        break;
      }
      total += m;
    }
    if (ok) best = Math.max(best ?? 0, total);
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Búsqueda                                                            */
/* ------------------------------------------------------------------ */

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface SearchResult {
  items: PublicProfessional[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  facets: { areas: FacetOption[]; specialties: FacetOption[]; cities: FacetOption[] };
}

const collator = new Intl.Collator("es-MX", { sensitivity: "base" });

export function compareAlphabetical(a: PublicProfessional, b: PublicProfessional): number {
  return collator.compare(a.sortName, b.sortName) || a.id.localeCompare(b.id);
}

type FilterKey = "area" | "especialidad" | "ciudad";

function passesFilters(
  entry: IndexedProfessional,
  query: DirectoryQuery,
  skip: FilterKey[] = [],
): boolean {
  const p = entry.professional;
  if (query.area && !skip.includes("area") && p.areaId !== query.area) return false;
  if (
    query.especialidad &&
    !skip.includes("especialidad") &&
    !p.specialtySlugs.includes(query.especialidad)
  )
    return false;
  if (
    query.ciudad &&
    !skip.includes("ciudad") &&
    !entry.locations.some((l) => l.citySlug === query.ciudad)
  )
    return false;
  return true;
}

function countBy<T>(items: T[], keys: (item: T) => string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const key of new Set(keys(item))) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Busca sobre perfiles ya publicados. Aplica en conjunto texto, ubicación
 * y filtros; ordena por coincidencia o alfabéticamente con desempate estable.
 */
export function searchProfessionals(
  professionals: readonly PublicProfessional[],
  query: DirectoryQuery,
  pageSize = PAGE_SIZE,
): SearchResult {
  const scored: { entry: IndexedProfessional; score: number }[] = [];
  for (const p of professionals) {
    if (p.status !== "published") continue;
    const entry = indexProfessional(p);
    const text = scoreText(entry, query.q);
    if (text === null) continue;
    const loc = scoreLocation(entry, query.ubicacion);
    if (loc === null) continue;
    scored.push({ entry, score: text + loc });
  }

  const matching = scored.filter((s) => passesFilters(s.entry, query));
  if (query.orden === "relevancia") {
    matching.sort(
      (a, b) => b.score - a.score || compareAlphabetical(a.entry.professional, b.entry.professional),
    );
  } else {
    matching.sort((a, b) => compareAlphabetical(a.entry.professional, b.entry.professional));
  }

  const total = matching.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.pagina, pageCount);
  const items = matching
    .slice((page - 1) * pageSize, page * pageSize)
    .map((s) => s.entry.professional);

  // Facetas: cada una cuenta resultados aplicando los demás filtros.
  const forAreas = scored.filter((s) => passesFilters(s.entry, query, ["area", "especialidad"]));
  const areaCounts = countBy(forAreas, (s) => [s.entry.professional.areaId]);
  const forSpecialties = scored.filter((s) => passesFilters(s.entry, query, ["especialidad"]));
  const specialtyCounts = countBy(forSpecialties, (s) => s.entry.professional.specialtySlugs);
  const forCities = scored.filter((s) => passesFilters(s.entry, query, ["ciudad"]));
  const cityCounts = countBy(forCities, (s) => s.entry.locations.map((l) => l.citySlug));
  const cityLabels = new Map<string, string>();
  for (const s of scored) for (const l of s.entry.locations) cityLabels.set(l.citySlug, l.location.city);

  return {
    items,
    total,
    page,
    pageCount,
    pageSize,
    facets: {
      areas: AREAS.filter((a) => areaCounts.has(a.id)).map((a) => ({
        value: a.id,
        label: a.label,
        count: areaCounts.get(a.id) ?? 0,
      })),
      specialties: [...specialtyCounts.entries()]
        .flatMap(([slug, count]) => {
          const s = getSpecialty(slug);
          if (!s || (query.area && s.areaId !== query.area)) return [];
          return [{ value: slug, label: s.name, count }];
        })
        .sort((a, b) => collator.compare(a.label, b.label)),
      cities: [...cityCounts.entries()]
        .map(([slug, count]) => ({ value: slug, label: cityLabels.get(slug) ?? slug, count }))
        .sort((a, b) => collator.compare(a.label, b.label)),
    },
  };
}
