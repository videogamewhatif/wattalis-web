import { site } from "@/lib/site";
import { FALLBACK_CATALOG } from "./fallback";
import type { BillingInterval, PlansCatalog, PublicFeature, PublicPlan } from "./types";

export type { BillingInterval, PlansCatalog, PublicPlan } from "./types";
export { FALLBACK_CATALOG } from "./fallback";

const isStr = (v: unknown, max = 300): v is string => typeof v === "string" && v.length <= max;
const isCents = (v: unknown) => v === null || (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 100_000_000);
const isBps = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 10_000;

/**
 * Valida lo que responde la aplicación. Ante cualquier dato inesperado se
 * descarta todo (no se muestran precios a medias).
 */
export function parseCatalog(input: unknown): PlansCatalog | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  const settings = data.settings as Record<string, unknown> | undefined;
  if (!settings || !isBps(settings.annual_discount_bps) || !isBps(settings.tax_rate_bps) || typeof settings.prices_include_tax !== "boolean") return null;
  if (!Number.isInteger(settings.grace_period_days) || !Number.isInteger(settings.trial_days)) return null;
  if (!Array.isArray(data.plans) || data.plans.length === 0 || data.plans.length > 12) return null;
  if (!Array.isArray(data.entitlements) || data.entitlements.length > 400) return null;
  if (!Array.isArray(data.features) || data.features.length > 80) return null;
  if (!Array.isArray(data.groups) || data.groups.length > 20) return null;

  const plans: PublicPlan[] = [];
  for (const raw of data.plans as Record<string, unknown>[]) {
    if (!raw || !isStr(raw.code, 40) || !/^[a-z][a-z0-9_-]{1,39}$/.test(raw.code) || !isStr(raw.name, 60) || !isStr(raw.description)) return null;
    if (!(raw.badge === null || isStr(raw.badge, 30)) || !Number.isInteger(raw.tier) || typeof raw.is_custom_pricing !== "boolean") return null;
    if (!isCents(raw.monthly_price_cents) || !isCents(raw.annual_price_cents)) return null;
    if (!raw.is_custom_pricing && (raw.monthly_price_cents === null || raw.annual_price_cents === null)) return null;
    plans.push({
      code: raw.code,
      name: raw.name,
      description: raw.description,
      badge: (raw.badge as string | null) ?? null,
      tier: raw.tier as number,
      monthly_price_cents: raw.monthly_price_cents as number | null,
      annual_price_cents: raw.annual_price_cents as number | null,
      is_custom_pricing: raw.is_custom_pricing,
    });
  }
  const features: PublicFeature[] = [];
  for (const raw of data.features as Record<string, unknown>[]) {
    if (!raw || !isStr(raw.code, 60) || !isStr(raw.label, 120) || !(raw.kind === "limit" || raw.kind === "feature") || !isStr(raw.group, 40)) return null;
    features.push({ code: raw.code, label: raw.label, kind: raw.kind, group: raw.group, hint: isStr(raw.hint) ? raw.hint : null, soon: raw.soon === true });
  }
  const entitlements: PlansCatalog["entitlements"] = [];
  for (const raw of data.entitlements as Record<string, unknown>[]) {
    if (!raw || !isStr(raw.plan_code, 40) || !isStr(raw.feature_code, 60)) return null;
    if (!(raw.usage_limit === null || (Number.isInteger(raw.usage_limit) && (raw.usage_limit as number) >= 0))) return null;
    entitlements.push({ plan_code: raw.plan_code, feature_code: raw.feature_code, usage_limit: raw.usage_limit as number | null });
  }
  const groups: PlansCatalog["groups"] = [];
  for (const raw of data.groups as Record<string, unknown>[]) {
    if (!raw || !isStr(raw.key, 40) || !isStr(raw.label, 80)) return null;
    groups.push({ key: raw.key, label: raw.label });
  }
  return {
    demo: data.demo === true,
    settings: {
      annual_discount_bps: settings.annual_discount_bps as number,
      tax_rate_bps: settings.tax_rate_bps as number,
      prices_include_tax: settings.prices_include_tax,
      grace_period_days: settings.grace_period_days as number,
      trial_days: settings.trial_days as number,
    },
    plans: plans.sort((a, b) => a.tier - b.tier),
    entitlements,
    features,
    groups,
  };
}

/** URL base de la aplicación con diagonal final (para resolver rutas relativas). */
function appBase(): string | null {
  if (!site.appUrl) return null;
  return site.appUrl.endsWith("/") ? site.appUrl : `${site.appUrl}/`;
}

/** Segundos que se reutiliza la respuesta de la aplicación. */
export const CATALOG_REVALIDATE = 60;

/**
 * Catálogo vigente: lo publica la aplicación privada (lo que configura el panel
 * de Wattalis). Si no hay URL de la aplicación o no responde a tiempo, se usan
 * los valores iniciales ilustrativos.
 */
export async function getPlansCatalog(fetcher: typeof fetch = fetch): Promise<{ catalog: PlansCatalog; source: "app" | "fallback" }> {
  const base = appBase();
  if (!base) return { catalog: FALLBACK_CATALOG, source: "fallback" };
  try {
    const res = await fetcher(new URL("api/billing/catalog", base), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: CATALOG_REVALIDATE },
    });
    if (!res.ok) return { catalog: FALLBACK_CATALOG, source: "fallback" };
    const parsed = parseCatalog(await res.json());
    return parsed ? { catalog: parsed, source: "app" } : { catalog: FALLBACK_CATALOG, source: "fallback" };
  } catch {
    return { catalog: FALLBACK_CATALOG, source: "fallback" };
  }
}

const PERIOD: Record<BillingInterval, string> = { month: "mensual", year: "anual" };

/** Inicio de la contratación en la aplicación privada (paso 1), o null si no hay URL configurada. */
export function checkoutHref(planCode: string, interval: BillingInterval): string | null {
  const base = appBase();
  if (!base) return null;
  const url = new URL("suscripcion/seleccionar", base);
  url.searchParams.set("plan", planCode);
  url.searchParams.set("periodo", PERIOD[interval]);
  return url.toString();
}

/** Página completa de precios y contratación en la aplicación. */
export function appPricingHref(): string | null {
  const base = appBase();
  return base ? new URL("precios", base).toString() : null;
}
