import type { PlansCatalog } from "./types";

/**
 * Respaldo ILUSTRATIVO: los mismos valores iniciales de la aplicación privada.
 * Se usa solo si la aplicación no responde. Los precios vigentes los define el
 * panel de Wattalis y llegan por `GET /api/billing/catalog`.
 */
const CORE = ["module.agenda", "module.patients", "module.services", "module.cash", "module.schedules", "activity.history", "reports.basic"];

const PLAN_FEATURES: Record<string, { limits: Record<string, number | null>; features: string[] }> = {
  esencial: { limits: { "professionals.max": 1, "users.max": 2, "workspaces.max": 1 }, features: CORE },
  profesional: { limits: { "professionals.max": 5, "users.max": 10, "workspaces.max": 1 }, features: [...CORE, "reports.financial", "reminders.automatic"] },
  empresarial: {
    limits: { "professionals.max": 20, "users.max": 50, "workspaces.max": 1 },
    features: [...CORE, "reports.financial", "reports.advanced", "admin.advanced", "areas.multiple", "reminders.automatic", "automations", "support.priority"],
  },
  corporativo: {
    limits: { "professionals.max": null, "users.max": null, "workspaces.max": null },
    features: [
      ...CORE,
      "reports.financial",
      "reports.advanced",
      "admin.advanced",
      "areas.multiple",
      "reminders.automatic",
      "automations",
      "support.priority",
      "billing.central",
      "admin.enterprise",
      "api.access",
    ],
  },
};

const annual = (monthly: number) => Math.round((monthly * 12 * 8500) / 10000);

export const FALLBACK_CATALOG: PlansCatalog = {
  demo: true,
  settings: { annual_discount_bps: 1500, tax_rate_bps: 1600, prices_include_tax: true, grace_period_days: 7, trial_days: 14 },
  plans: [
    { code: "esencial", name: "Esencial", description: "Para profesionales independientes.", badge: null, tier: 1, monthly_price_cents: 39_900, annual_price_cents: annual(39_900), is_custom_pricing: false },
    { code: "profesional", name: "Profesional", description: "Para clínicas pequeñas.", badge: "Más popular", tier: 2, monthly_price_cents: 89_900, annual_price_cents: annual(89_900), is_custom_pricing: false },
    { code: "empresarial", name: "Empresarial", description: "Para clínicas y centros médicos grandes.", badge: null, tier: 3, monthly_price_cents: 199_900, annual_price_cents: annual(199_900), is_custom_pricing: false },
    { code: "corporativo", name: "Corporativo", description: "Para hospitales y grupos médicos.", badge: null, tier: 4, monthly_price_cents: null, annual_price_cents: null, is_custom_pricing: true },
  ],
  entitlements: Object.entries(PLAN_FEATURES).flatMap(([plan_code, p]) => [
    ...Object.entries(p.limits).map(([feature_code, usage_limit]) => ({ plan_code, feature_code, usage_limit })),
    ...p.features.map((feature_code) => ({ plan_code, feature_code, usage_limit: null })),
  ]),
  features: [
    { code: "professionals.max", label: "Profesionales", kind: "limit", group: "capacidad", hint: "Perfiles profesionales activos que reciben citas.", soon: false },
    { code: "users.max", label: "Usuarios internos", kind: "limit", group: "capacidad", hint: "Cuentas de administración, recepción y profesionales.", soon: false },
    { code: "workspaces.max", label: "Espacios de trabajo", kind: "limit", group: "capacidad", hint: "Sedes o clínicas con información independiente.", soon: false },
    { code: "module.agenda", label: "Agenda de citas", kind: "feature", group: "operacion", hint: null, soon: false },
    { code: "module.patients", label: "Gestión de pacientes", kind: "feature", group: "operacion", hint: null, soon: false },
    { code: "module.services", label: "Servicios y precios", kind: "feature", group: "operacion", hint: null, soon: false },
    { code: "module.cash", label: "Control de cobros (caja)", kind: "feature", group: "operacion", hint: null, soon: false },
    { code: "module.schedules", label: "Horarios y bloqueos", kind: "feature", group: "operacion", hint: null, soon: false },
    { code: "activity.history", label: "Historial de cambios de cada cita", kind: "feature", group: "operacion", hint: null, soon: false },
    { code: "areas.multiple", label: "Gestión de diferentes áreas médicas", kind: "feature", group: "operacion", hint: "Filtra agenda y profesionales por área (medicina, odontología, nutrición…).", soon: false },
    { code: "reports.basic", label: "Reportes básicos", kind: "feature", group: "reportes", hint: "Citas, citas atendidas sin cobro y actividad propia.", soon: false },
    { code: "reports.financial", label: "Reportes financieros", kind: "feature", group: "reportes", hint: "Ventas, ingresos por concepto y cortes de caja.", soon: false },
    { code: "reports.advanced", label: "Reportes avanzados", kind: "feature", group: "reportes", hint: "Desempeño por profesional y análisis de pacientes.", soon: false },
    { code: "admin.advanced", label: "Auditoría de cancelaciones y descuentos", kind: "feature", group: "reportes", hint: null, soon: false },
    { code: "reminders.automatic", label: "Recordatorios automáticos", kind: "feature", group: "automatizacion", hint: null, soon: true },
    { code: "automations", label: "Automatizaciones", kind: "feature", group: "automatizacion", hint: null, soon: true },
    { code: "support.priority", label: "Soporte prioritario", kind: "feature", group: "empresa", hint: null, soon: true },
    { code: "billing.central", label: "Facturación centralizada de varias sedes", kind: "feature", group: "empresa", hint: null, soon: false },
    { code: "admin.enterprise", label: "Administración empresarial", kind: "feature", group: "empresa", hint: null, soon: false },
    { code: "api.access", label: "Integraciones por API", kind: "feature", group: "empresa", hint: null, soon: true },
  ],
  groups: [
    { key: "capacidad", label: "Capacidad" },
    { key: "operacion", label: "Operación diaria" },
    { key: "reportes", label: "Reportes" },
    { key: "automatizacion", label: "Automatización" },
    { key: "empresa", label: "Administración empresarial" },
  ],
};
