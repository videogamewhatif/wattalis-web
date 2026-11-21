import type { DirectoryQuery, SearchResult } from "./search";
import type { PublicProfessional } from "./types";

/**
 * Contrato de lectura del directorio público.
 *
 * Cualquier fuente (datos de demostración, API pública de lectura, archivo
 * exportado) debe cumplir estas reglas:
 *
 * 1. Devolver únicamente perfiles con `status: "published"`. El filtro se
 *    aplica en la fuente y otra vez en la capa de lectura (`index.ts`).
 * 2. Exponer solo los campos de `PublicProfessional`. Nunca pacientes, citas,
 *    cobros, horarios operativos de agenda, notas internas ni credenciales.
 * 3. Ejecutarse solo en el servidor. Las claves de acceso, si existen, se leen
 *    de variables de entorno sin el prefijo `NEXT_PUBLIC_`.
 */
export interface DirectoryProvider {
  readonly name: string;
  listPublishedProfessionals(): Promise<PublicProfessional[]>;
  /** `null` si el slug no existe o el perfil no está publicado. */
  getPublishedProfessionalBySlug(slug: string): Promise<PublicProfessional | null>;
  /**
   * Opcional: búsqueda delegada a la fuente. Si no se implementa, la capa de
   * lectura busca en memoria sobre `listPublishedProfessionals()`.
   */
  search?(query: DirectoryQuery): Promise<SearchResult>;
}
