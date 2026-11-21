import type { DirectoryProvider } from "../provider";
import type { PublicProfessional } from "../types";
import { DEMO_PROFESSIONALS } from "./demo-data";

/** Proveedor local con perfiles ficticios. No requiere base de datos. */
export function createDemoProvider(
  source: readonly PublicProfessional[] = DEMO_PROFESSIONALS,
): DirectoryProvider {
  const published = () =>
    source.filter((p) => p.status === "published").map((p) => structuredClone(p));
  return {
    name: "demo",
    async listPublishedProfessionals() {
      return published();
    },
    async getPublishedProfessionalBySlug(slug) {
      return published().find((p) => p.slug === slug) ?? null;
    },
  };
}
