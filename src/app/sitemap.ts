import type { MetadataRoute } from "next";
import { getPublishedCatalog, listProfessionals } from "@/lib/directory";
import { loadLegalDocument } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";

/**
 * Solo páginas públicas aprobadas: sin combinaciones de filtros, sin perfiles
 * de demostración ni textos legales pendientes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [professionals, catalog, privacy, terms] = await Promise.all([
    listProfessionals(),
    getPublishedCatalog(),
    loadLegalDocument("privacidad"),
    loadLegalDocument("terminos"),
  ]);
  const real = professionals.filter((p) => !p.isDemo);

  const staticPaths = ["/", "/especialistas", "/especialidades", "/para-clinicas", "/planes", "/nosotros", "/contacto"];
  if (privacy) staticPaths.push("/privacidad");
  if (terms) staticPaths.push("/terminos");

  const specialtyPaths = catalog
    .flatMap((g) => g.specialties)
    .filter((s) => real.some((p) => p.specialtySlugs.includes(s.slug)))
    .map((s) => `/especialidades/${s.slug}`);

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...specialtyPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...real.map((p) => ({ url: absoluteUrl(`/especialistas/${p.slug}`) })),
  ];
}
