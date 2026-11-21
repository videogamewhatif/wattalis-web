import type { Metadata } from "next";
import { site } from "./site";

/**
 * Política de indexación.
 * - Si `WATTALIS_ALLOW_INDEXING` no es `true`, nada se indexa.
 * - Con indexación activa, cada página decide (`indexable`): perfiles demo,
 *   búsquedas con parámetros y textos legales pendientes quedan fuera.
 */
export function robotsFor(indexable = true): Metadata["robots"] {
  if (site.allowIndexing && indexable) return { index: true, follow: true };
  return { index: false, follow: site.allowIndexing };
}

export function pageMetadata({
  title,
  description,
  path,
  indexable = true,
}: {
  title?: string;
  description: string;
  path: string;
  indexable?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: robotsFor(indexable),
    openGraph: {
      title: title ? `${title} · ${site.name}` : site.name,
      description,
      url: path,
      siteName: site.name,
      locale: "es_MX",
      type: "website",
      // Al definir openGraph por página se reemplaza el de la raíz, así que
      // se vuelve a declarar la imagen generada en src/app/opengraph-image.tsx.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
    },
  };
}
