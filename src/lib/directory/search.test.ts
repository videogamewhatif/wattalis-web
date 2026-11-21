import { describe, expect, it } from "vitest";
import { normalizeText, tokenize } from "./normalize";
import { createDemoProvider } from "./providers/demo";
import { DEMO_PROFESSIONALS } from "./providers/demo-data";
import { parseDirectoryQuery, searchProfessionals, toSearchString } from "./search";

const search = (raw: Record<string, string>) =>
  searchProfessionals(DEMO_PROFESSIONALS, parseDirectoryQuery(raw), 100);
const slugs = (raw: Record<string, string>) => search(raw).items.map((p) => p.slug);

describe("normalización", () => {
  it("ignora mayúsculas, acentos y espacios sobrantes", () => {
    expect(normalizeText("  Psicología   CLÍNICA ")).toBe("psicologia clinica");
    expect(tokenize("Ciudad de México")).toEqual(["ciudad", "mexico"]);
  });
});

describe("búsqueda", () => {
  it("«psicologa» sin acento encuentra perfiles de psicología", () => {
    const result = search({ q: "psicologa" });
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((p) => p.areaId === "psicologia")).toBe(true);
  });

  it("agregar una ciudad reduce los resultados y ambas condiciones se cumplen", () => {
    const all = search({ q: "psicologa" });
    const cdmx = search({ q: "psicologa", ubicacion: "Ciudad de México" });
    expect(cdmx.total).toBeGreaterThan(0);
    expect(cdmx.total).toBeLessThan(all.total);
    for (const p of cdmx.items) {
      expect(p.areaId).toBe("psicologia");
      expect(p.locations.some((l) => l.city === "Ciudad de México")).toBe(true);
    }
  });

  it("reconoce alias y códigos postales", () => {
    expect(slugs({ q: "psicologia", ubicacion: "cdmx" })).toEqual(
      slugs({ q: "psicologia", ubicacion: "ciudad de mexico" }),
    );
    expect(slugs({ ubicacion: "06700" })).toEqual(["ana-lucia-rios-peralta"]);
    expect(slugs({ ubicacion: "zapopan" }).length).toBeGreaterThan(0);
  });

  it("busca por servicio y por nombre", () => {
    expect(slugs({ q: "brackets" })).toContain("daniel-fuentes-oropeza");
    expect(slugs({ q: "villasenor" })).toEqual(["jorge-arturo-villasenor-lara"]);
  });

  it("aplica filtros de área, especialidad y ciudad", () => {
    expect(search({ area: "optica" }).items.every((p) => p.areaId === "optica")).toBe(true);
    expect(slugs({ especialidad: "ortodoncia" })).toEqual(["daniel-fuentes-oropeza"]);
    const mty = search({ ciudad: "monterrey" });
    expect(mty.items.every((p) => p.locations.some((l) => l.city === "Monterrey"))).toBe(true);
  });

  it("devuelve cero resultados sin errores", () => {
    expect(search({ q: "cardiologia", ubicacion: "tijuana" }).total).toBe(0);
  });

  it("ordena alfabéticamente con desempate estable", () => {
    const names = search({}).items.map((p) => p.sortName);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "es-MX", { sensitivity: "base" }));
    expect(names).toEqual(sorted);
  });
});

describe("perfiles sin publicar", () => {
  it("no aparecen en la búsqueda aunque coincidan", () => {
    expect(slugs({ q: "hector medina" })).toEqual([]);
    expect(search({}).items.some((p) => p.status !== "published")).toBe(false);
  });

  it("el proveedor demo no los devuelve ni por slug", async () => {
    const provider = createDemoProvider();
    expect(await provider.getPublishedProfessionalBySlug("hector-medina-rosales")).toBeNull();
    expect(await provider.getPublishedProfessionalBySlug("no-existe")).toBeNull();
    const list = await provider.listPublishedProfessionals();
    expect(list.find((p) => p.slug === "hector-medina-rosales")).toBeUndefined();
    expect(list.length).toBeGreaterThanOrEqual(12);
  });
});

describe("estado en la URL", () => {
  it("serializa y restaura la búsqueda completa", () => {
    const raw = { q: "psicologia", ubicacion: "cdmx", area: "psicologia", orden: "alfabetico", pagina: "2" };
    const query = parseDirectoryQuery(raw);
    const qs = toSearchString(query, { pagina: query.pagina });
    expect(qs).toBe("?q=psicologia&ubicacion=cdmx&area=psicologia&orden=alfabetico&pagina=2");
    expect(parseDirectoryQuery(Object.fromEntries(new URLSearchParams(qs)))).toEqual(query);
  });

  it("reinicia la página al cambiar un criterio e ignora valores desconocidos", () => {
    const query = parseDirectoryQuery({ q: "dental", pagina: "3", area: "inventada" });
    expect(query.area).toBeUndefined();
    expect(toSearchString(query, { ubicacion: "monterrey" })).toBe("?q=dental&ubicacion=monterrey");
  });
});
