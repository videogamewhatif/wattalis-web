import { readFile } from "node:fs/promises";
import path from "node:path";

export type LegalDocumentId = "privacidad" | "terminos";

export interface LegalDocument {
  body: string;
  updated?: string;
}

/**
 * Carga el texto aprobado desde `content/legal/<id>.md`.
 * Devuelve `null` mientras la empresa no haya entregado el documento.
 */
export async function loadLegalDocument(id: LegalDocumentId): Promise<LegalDocument | null> {
  const file = path.join(process.cwd(), "content", "legal", `${id}.md`);
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return null;
  }
  let body = raw.replace(/\r\n/g, "\n");
  let updated: string | undefined;
  const front = body.match(/^---\n([\s\S]*?)\n---\n/);
  if (front) {
    updated = front[1].match(/^actualizado:\s*(.+)$/m)?.[1]?.trim();
    body = body.slice(front[0].length);
  }
  body = body.trim();
  return body ? { body, updated } : null;
}
