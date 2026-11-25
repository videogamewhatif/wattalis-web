import { afterEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_CATALOG } from "./fallback";
import { parseCatalog } from "./index";
import { comparisonCell, formatCents, planHighlights, quotePlan } from "./pricing";

const settings = FALLBACK_CATALOG.settings;
const plan = (code: string) => FALLBACK_CATALOG.plans.find((p) => p.code === code)!;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("precios", () => {
  it("mensual y anual con 15 % de descuento, en centavos exactos", () => {
    expect(quotePlan(plan("profesional"), "month", settings)).toMatchObject({ periodPriceCents: 89_900, monthlyEquivalentCents: 89_900, annualSavingsCents: 0 });
    const year = quotePlan(plan("profesional"), "year", settings)!;
    expect(year).toMatchObject({ periodPriceCents: 916_980, monthlyEquivalentCents: 76_415, annualSavingsCents: 161_820, taxIncluded: true });
    expect(formatCents(year.periodPriceCents)).toBe("$9,169.80");
    expect(quotePlan(plan("corporativo"), "month", settings)).toBeNull();
  });

  it("los beneficios se derivan del catálogo y dicen qué agrega cada plan", () => {
    const esencial = planHighlights(FALLBACK_CATALOG, plan("esencial"), null);
    expect(esencial.intro).toBeNull();
    expect(esencial.items).toEqual(expect.arrayContaining(["1 profesional", "2 usuarios internos", "Agenda de citas"]));
    const profesional = planHighlights(FALLBACK_CATALOG, plan("profesional"), plan("esencial"));
    expect(profesional.intro).toBe("Todo lo del plan Esencial, más:");
    expect(profesional.items).toEqual(["Hasta 5 profesionales", "Hasta 10 usuarios internos", "Reportes financieros", "Recordatorios automáticos (próximamente)"]);
  });

  it("la comparativa distingue límites, incluidas y no incluidas", () => {
    expect(comparisonCell(FALLBACK_CATALOG, "esencial", "professionals.max")).toEqual({ included: true, text: "1" });
    expect(comparisonCell(FALLBACK_CATALOG, "corporativo", "users.max")).toEqual({ included: true, text: "A la medida" });
    expect(comparisonCell(FALLBACK_CATALOG, "empresarial", "areas.multiple")).toEqual({ included: true, text: null });
    expect(comparisonCell(FALLBACK_CATALOG, "esencial", "reports.financial")).toEqual({ included: false, text: null });
  });
});

describe("catálogo publicado por la aplicación", () => {
  it("acepta el formato de GET /api/billing/catalog", () => {
    const parsed = parseCatalog({ version: 1, ...FALLBACK_CATALOG });
    expect(parsed?.plans.map((p) => p.code)).toEqual(["esencial", "profesional", "empresarial", "corporativo"]);
  });

  it("descarta respuestas con datos inesperados (no muestra precios a medias)", () => {
    expect(parseCatalog(null)).toBeNull();
    expect(parseCatalog({ ...FALLBACK_CATALOG, plans: [] })).toBeNull();
    expect(parseCatalog({ ...FALLBACK_CATALOG, plans: [{ ...plan("esencial"), monthly_price_cents: -1 }] })).toBeNull();
    expect(parseCatalog({ ...FALLBACK_CATALOG, plans: [{ ...plan("esencial"), monthly_price_cents: 12.5 }] })).toBeNull();
    expect(parseCatalog({ ...FALLBACK_CATALOG, plans: [{ ...plan("esencial"), code: "<script>" }] })).toBeNull();
    expect(parseCatalog({ ...FALLBACK_CATALOG, settings: { ...settings, tax_rate_bps: "16" } })).toBeNull();
  });

  it("sin URL de la aplicación usa el respaldo y no ofrece contratación en línea", async () => {
    vi.stubEnv("NEXT_PUBLIC_WATTALIS_APP_URL", "");
    const mod = await import("./index");
    const fetcher = vi.fn();
    expect(await mod.getPlansCatalog(fetcher as unknown as typeof fetch)).toEqual({ catalog: FALLBACK_CATALOG, source: "fallback" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(mod.checkoutHref("profesional", "year")).toBeNull();
  });

  it("con URL lee los precios vigentes de la aplicación y arma el enlace de contratación", async () => {
    vi.stubEnv("NEXT_PUBLIC_WATTALIS_APP_URL", "https://app.wattalis.example");
    const mod = await import("./index");
    const edited = { ...FALLBACK_CATALOG, demo: true, plans: FALLBACK_CATALOG.plans.map((p) => (p.code === "esencial" ? { ...p, monthly_price_cents: 49_900, annual_price_cents: 508_980 } : p)) };
    const fetcher = vi.fn(async () => new Response(JSON.stringify(edited), { status: 200 }));
    const { catalog, source } = await mod.getPlansCatalog(fetcher as unknown as typeof fetch);
    expect(source).toBe("app");
    expect(catalog.plans[0].monthly_price_cents).toBe(49_900);
    expect(String((fetcher.mock.calls[0] as unknown[])[0])).toBe("https://app.wattalis.example/api/billing/catalog");
    expect(mod.checkoutHref("profesional", "year")).toBe("https://app.wattalis.example/suscripcion/seleccionar?plan=profesional&periodo=anual");
    expect(mod.appPricingHref()).toBe("https://app.wattalis.example/precios");
  });

  it("si la aplicación no responde o falla, usa el respaldo", async () => {
    vi.stubEnv("NEXT_PUBLIC_WATTALIS_APP_URL", "https://app.wattalis.example");
    const mod = await import("./index");
    const down = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    expect((await mod.getPlansCatalog(down as unknown as typeof fetch)).source).toBe("fallback");
    const error = vi.fn(async () => new Response("error", { status: 500 }));
    expect((await mod.getPlansCatalog(error as unknown as typeof fetch)).source).toBe("fallback");
    const malformed = vi.fn(async () => new Response(JSON.stringify({ plans: "nada" }), { status: 200 }));
    expect((await mod.getPlansCatalog(malformed as unknown as typeof fetch)).source).toBe("fallback");
  });
});
