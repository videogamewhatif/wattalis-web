import { InfoIcon } from "./icons";
import { Markdown } from "./Markdown";
import type { LegalDocument } from "@/lib/legal";

/** Página legal: muestra el texto aprobado o un estado pendiente transparente. */
export function LegalPage({
  title,
  document,
  file,
}: {
  title: string;
  document: LegalDocument | null;
  file: string;
}) {
  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <h1>{title}</h1>
        {document?.updated && <p className="muted">Última actualización: {document.updated}</p>}
      </header>
      {document ? (
        <article className="prose">
          <Markdown source={document.body} />
        </article>
      ) : (
        <div className="stack" style={{ maxWidth: 720 }}>
          <p className="notice">
            <InfoIcon />
            <span>
              <strong>Documento pendiente.</strong> Este espacio mostrará el texto aprobado por
              Wattalis. Mientras tanto, la página no se indexa en buscadores.
            </span>
          </p>
          {process.env.NODE_ENV !== "production" && (
            <p className="muted" style={{ fontSize: "0.9375rem" }}>
              Para publicarlo, agrega el archivo <code>{file}</code> (consulta el README).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
