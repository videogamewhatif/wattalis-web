import type { BillingInterval, PlansCatalog, PublicPlan } from "./types";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const moneyRound = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

/** $1,234.50 (o $1,234 si no hay centavos y `compact`). */
export function formatCents(cents: number, { compact = false }: { compact?: boolean } = {}): string {
  if (compact && cents % 100 === 0) return moneyRound.format(cents / 100);
  return money.format(cents / 100);
}

export interface PlanQuote {
  /** Lo que se cobra en cada periodo. */
  periodPriceCents: number;
  /** Referencia por mes (en anual: total / 12). */
  monthlyEquivalentCents: number;
  /** Mensual × 12, para comparar. */
  listAnnualCents: number;
  /** Ahorro anual frente a pagar mes a mes (0 en mensual). */
  annualSavingsCents: number;
  taxIncluded: boolean;
  taxRateBps: number;
}

/** Cotización de un plan; null si su precio es personalizado. */
export function quotePlan(plan: PublicPlan, interval: BillingInterval, settings: PlansCatalog["settings"]): PlanQuote | null {
  if (plan.is_custom_pricing || plan.monthly_price_cents === null || plan.annual_price_cents === null) return null;
  const listAnnual = plan.monthly_price_cents * 12;
  const period = interval === "month" ? plan.monthly_price_cents : plan.annual_price_cents;
  return {
    periodPriceCents: period,
    monthlyEquivalentCents: interval === "month" ? plan.monthly_price_cents : Math.round(plan.annual_price_cents / 12),
    listAnnualCents: listAnnual,
    annualSavingsCents: interval === "year" ? Math.max(listAnnual - plan.annual_price_cents, 0) : 0,
    taxIncluded: settings.prices_include_tax,
    taxRateBps: settings.tax_rate_bps,
  };
}

export function percent(bps: number): string {
  return `${(bps / 100).toLocaleString("es-MX", { maximumFractionDigits: 2 })} %`;
}

function limitText(code: string, limit: number | null): string | null {
  switch (code) {
    case "professionals.max":
      return limit === null ? "Profesionales según tu operación" : limit === 1 ? "1 profesional" : `Hasta ${limit} profesionales`;
    case "users.max":
      return limit === null ? "Usuarios internos a la medida" : limit === 1 ? "1 usuario interno" : `${limit <= 2 ? "" : "Hasta "}${limit} usuarios internos`;
    case "workspaces.max":
      return limit === null ? "Múltiples espacios de trabajo" : limit === 1 ? null : `Hasta ${limit} espacios de trabajo`;
    default:
      return null;
  }
}

/** Beneficios de la tarjeta: límites y lo que agrega frente al plan anterior. */
export function planHighlights(catalog: PlansCatalog, plan: PublicPlan, previous: PublicPlan | null): { intro: string | null; items: string[] } {
  const own = catalog.entitlements.filter((e) => e.plan_code === plan.code);
  const prevCodes = new Set(previous ? catalog.entitlements.filter((e) => e.plan_code === previous.code).map((e) => e.feature_code) : []);
  const limits = catalog.features
    .filter((f) => f.kind === "limit")
    .map((f) => {
      const e = own.find((x) => x.feature_code === f.code);
      return e ? limitText(f.code, e.usage_limit) : null;
    })
    .filter((t): t is string => Boolean(t));
  const features = catalog.features
    .filter((f) => f.kind === "feature" && own.some((e) => e.feature_code === f.code) && !prevCodes.has(f.code))
    .sort((a, b) => Number(a.soon) - Number(b.soon))
    .map((f) => (f.soon ? `${f.label} (próximamente)` : f.label));
  const items = [...limits, ...features];
  if (plan.is_custom_pricing) items.push("Condiciones comerciales particulares");
  return { intro: previous ? `Todo lo del plan ${previous.name}, más:` : null, items };
}

/** Valor de una celda de la comparativa. */
export function comparisonCell(catalog: PlansCatalog, planCode: string, featureCode: string): { included: boolean; text: string | null } {
  const feature = catalog.features.find((f) => f.code === featureCode);
  const e = catalog.entitlements.find((x) => x.plan_code === planCode && x.feature_code === featureCode);
  if (!e) return { included: false, text: null };
  if (feature?.kind === "limit") return { included: true, text: e.usage_limit === null ? "A la medida" : String(e.usage_limit) };
  return { included: true, text: null };
}

export function annualDiscountLabel(catalog: PlansCatalog): string {
  return percent(catalog.settings.annual_discount_bps);
}

