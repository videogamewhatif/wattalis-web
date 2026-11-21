/**
 * Configuración institucional leída de variables de entorno.
 * Todo canal es opcional: si no está configurado, la interfaz lo omite.
 */

function clean(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

/** Acepta solo URL absolutas http(s). */
function safeUrl(value: string | undefined): string | undefined {
  const v = clean(value);
  if (!v) return undefined;
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeEmail(value: string | undefined): string | undefined {
  const v = clean(value);
  return v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : undefined;
}

export interface SocialLink {
  label: string;
  url: string;
}

const siteUrl = (safeUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const site = {
  name: "Wattalis",
  url: siteUrl,
  locale: "es-MX",
  description:
    "Encuentra especialistas de la salud por nombre, especialidad o ubicación y conoce cómo contactar a cada consultorio. Wattalis también ofrece software para gestionar clínicas y consultorios.",
  /** URL de la aplicación privada. Sin ella se omite «Acceso al sistema». */
  appUrl: safeUrl(process.env.NEXT_PUBLIC_WATTALIS_APP_URL),
  /** Solo con `true` se permite indexar el sitio. */
  allowIndexing: process.env.WATTALIS_ALLOW_INDEXING === "true",
  contact: {
    email: safeEmail(process.env.WATTALIS_CONTACT_EMAIL),
    phone: clean(process.env.WATTALIS_CONTACT_PHONE),
    salesEmail: safeEmail(process.env.WATTALIS_SALES_EMAIL),
    salesPhone: clean(process.env.WATTALIS_SALES_PHONE),
  },
  social: [
    { label: "Facebook", url: safeUrl(process.env.WATTALIS_SOCIAL_FACEBOOK) },
    { label: "Instagram", url: safeUrl(process.env.WATTALIS_SOCIAL_INSTAGRAM) },
    { label: "LinkedIn", url: safeUrl(process.env.WATTALIS_SOCIAL_LINKEDIN) },
  ].filter((s): s is SocialLink => Boolean(s.url)),
};

/** Destino del botón «Contactar a Wattalis». */
export function salesContactHref(): string {
  if (site.contact.salesEmail) {
    const subject = encodeURIComponent("Información sobre Wattalis para mi consultorio");
    return `mailto:${site.contact.salesEmail}?subject=${subject}`;
  }
  return "/contacto";
}

export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
