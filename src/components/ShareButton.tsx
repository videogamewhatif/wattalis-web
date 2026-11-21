"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ShareIcon } from "./icons";

/** Copia clásica para navegadores o contextos sin API de portapapeles. */
function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/** Copia la URL pública del perfil y confirma la acción. */
export function ShareButton({ path }: { path: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const [url, setUrl] = useState(path);
  const inputRef = useRef<HTMLInputElement>(null);

  async function copy() {
    const full = `${window.location.origin}${path}`;
    setUrl(full);
    try {
      await navigator.clipboard.writeText(full);
      setStatus("copied");
    } catch {
      // Sin acceso al portapapeles (p. ej. sitio sin HTTPS): copia clásica y,
      // si tampoco es posible, se muestra el enlace seleccionado.
      setStatus(legacyCopy(full) ? "copied" : "manual");
    }
  }

  useEffect(() => {
    if (status !== "copied") return;
    const t = window.setTimeout(() => setStatus("idle"), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (status === "manual") inputRef.current?.select();
  }, [status]);

  return (
    <div className="share">
      <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
        {status === "copied" ? <CheckIcon /> : <ShareIcon />}
        {status === "copied" ? "Enlace copiado" : "Compartir perfil"}
      </button>
      <span className="sr-only" role="status">
        {status === "copied" ? "Enlace del perfil copiado al portapapeles." : ""}
      </span>
      {status === "manual" && (
        <div className="share-fallback">
          <label htmlFor="share-url" className="muted">
            Copia este enlace:
          </label>
          <input id="share-url" ref={inputRef} readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}
    </div>
  );
}
