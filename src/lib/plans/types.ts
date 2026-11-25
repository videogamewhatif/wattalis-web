/**
 * Catálogo de planes tal como lo publica la aplicación privada en
 * `GET /api/billing/catalog`. Importes en centavos enteros (MXN).
 */
export type BillingInterval = "month" | "year";

export interface PublicPlan {
  code: string;
  name: string;
  description: string;
  badge: string | null;
  tier: number;
  /** null solo en planes de precio personalizado. */
  monthly_price_cents: number | null;
  annual_price_cents: number | null;
  is_custom_pricing: boolean;
}

export interface PublicFeature {
  code: string;
  label: string;
  kind: "limit" | "feature";
  group: string;
  hint: string | null;
  /** Aún no existe en el producto: se muestra «Próximamente». */
  soon: boolean;
}

export interface PlansCatalog {
  /** La aplicación está en modo demostración (sin cobros reales). */
  demo: boolean;
  settings: {
    annual_discount_bps: number;
    tax_rate_bps: number;
    prices_include_tax: boolean;
    grace_period_days: number;
    trial_days: number;
  };
  plans: PublicPlan[];
  /** Solo funciones incluidas. usage_limit null = sin límite. */
  entitlements: { plan_code: string; feature_code: string; usage_limit: number | null }[];
  features: PublicFeature[];
  groups: { key: string; label: string }[];
}
