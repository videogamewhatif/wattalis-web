import Link from "next/link";
import { site } from "@/lib/site";
import { AREAS } from "@/lib/directory";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo" aria-label="Wattalis, ir al inicio">
              Wattalis
              <span className="logo-dot" aria-hidden="true" />
            </Link>
            <p>
              Directorio para encontrar especialistas de la salud y software para gestionar
              clínicas y consultorios.
            </p>
          </div>
          <div className="footer-col">
            <h2>Directorio</h2>
            <ul>
              <li>
                <Link href="/especialistas">Buscar especialistas</Link>
              </li>
              <li>
                <Link href="/especialidades">Especialidades</Link>
              </li>
              {AREAS.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link href={`/especialistas?area=${a.id}`}>{a.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>Empresa</h2>
            <ul>
              <li>
                <Link href="/nosotros">Nosotros</Link>
              </li>
              <li>
                <Link href="/para-clinicas">Para clínicas</Link>
              </li>
              {site.appUrl && (
                <li>
                  <a href={site.appUrl}>Acceso al sistema</a>
                </li>
              )}
              <li>
                <Link href="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h2>Legal</h2>
            <ul>
              <li>
                <Link href="/privacidad">Aviso de privacidad</Link>
              </li>
              <li>
                <Link href="/terminos">Términos y condiciones</Link>
              </li>
            </ul>
            {site.social.length > 0 && (
              <>
                <h2 style={{ marginTop: 24 }}>Redes</h2>
                <ul>
                  {site.social.map((s) => (
                    <li key={s.label}>
                      <a href={s.url} rel="noopener noreferrer" target="_blank">
                        {s.label}
                        <span className="sr-only"> (se abre en una pestaña nueva)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} Wattalis</p>
          <p>Wattalis no ofrece orientación médica. En una emergencia, llama al 911.</p>
        </div>
      </div>
    </footer>
  );
}
