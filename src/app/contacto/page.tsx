import Link from "next/link";
import { InfoIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { telHref } from "@/lib/format";

export const metadata = pageMetadata({
  title: "Contacto",
  description: "Canales de contacto de Wattalis para clínicas, consultorios y público general.",
  path: "/contacto",
});

export default function ContactPage() {
  const { email, phone, salesEmail, salesPhone } = site.contact;
  const general = [
    email && { label: "Correo", href: `mailto:${email}`, text: email },
    phone && { label: "Teléfono", href: telHref(phone), text: phone },
  ].filter(Boolean) as { label: string; href: string; text: string }[];
  const sales = [
    salesEmail && { label: "Correo comercial", href: `mailto:${salesEmail}`, text: salesEmail },
    salesPhone && { label: "Teléfono comercial", href: telHref(salesPhone), text: salesPhone },
  ].filter(Boolean) as { label: string; href: string; text: string }[];
  const nothingConfigured = general.length === 0 && sales.length === 0 && site.social.length === 0;

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <h1>Contacto</h1>
        <p className="lead" style={{ maxWidth: 640 }}>
          ¿Buscas atención con un especialista? Comunícate directamente con el consultorio desde su{" "}
          <Link href="/especialistas">perfil en el directorio</Link>. Wattalis no agenda citas ni
          ofrece orientación médica.
        </p>
      </header>

      <div className="stack" style={{ gap: 32, maxWidth: 720 }}>
        {nothingConfigured && (
          <p className="notice">
            <InfoIcon />
            <span>
              <strong>Configuración pendiente.</strong> Este sitio está en demostración y todavía no
              tiene canales de contacto institucionales publicados.
            </span>
          </p>
        )}

        {sales.length > 0 && (
          <section className="stack" aria-labelledby="ventas-title">
            <h2 id="ventas-title" style={{ fontSize: "1.375rem" }}>
              Clínicas y consultorios
            </h2>
            <p className="muted">Para conocer el software de gestión de Wattalis.</p>
            <ContactList items={sales} />
          </section>
        )}

        {general.length > 0 && (
          <section className="stack" aria-labelledby="general-title">
            <h2 id="general-title" style={{ fontSize: "1.375rem" }}>
              Contacto general
            </h2>
            <ContactList items={general} />
          </section>
        )}

        {site.social.length > 0 && (
          <section className="stack" aria-labelledby="redes-title">
            <h2 id="redes-title" style={{ fontSize: "1.375rem" }}>
              Redes sociales
            </h2>
            <ul className="contact-list">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {site.appUrl && (
          <p className="muted">
            ¿Ya usas Wattalis? Entra desde <a href={site.appUrl}>Acceso al sistema</a>.
          </p>
        )}

        <p className="notice notice-info">
          <InfoIcon />
          <span>
            Por tu privacidad, no compartas síntomas, diagnósticos ni otra información médica por
            estos medios.
          </span>
        </p>
      </div>
    </div>
  );
}

function ContactList({ items }: { items: { label: string; href: string; text: string }[] }) {
  return (
    <ul className="contact-list">
      {items.map((item) => (
        <li key={item.label}>
          <span className="label">{item.label}</span>
          <a href={item.href}>{item.text}</a>
        </li>
      ))}
    </ul>
  );
}
