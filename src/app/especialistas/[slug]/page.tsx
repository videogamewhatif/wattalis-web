import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaTag, DemoTag } from "@/components/AreaTag";
import { Avatar } from "@/components/Avatar";
import { LocationBlock } from "@/components/LocationBlock";
import { ShareButton } from "@/components/ShareButton";
import { ArrowLeftIcon, InfoIcon } from "@/components/icons";
import {
  getArea,
  getProfessional,
  getSpecialty,
  parseDirectoryQuery,
  toSearchString,
  type PublicProfessional,
  type PublicService,
} from "@/lib/directory";
import { formatDuration, formatMXN } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Props = PageProps<"/especialistas/[slug]">;

function specialtyNames(p: PublicProfessional): string[] {
  return p.specialtySlugs.flatMap((s) => getSpecialty(s)?.name ?? []);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfessional(slug);
  if (!p) return { title: "Perfil no encontrado", robots: { index: false, follow: false } };
  const specialties = specialtyNames(p);
  const city = p.locations[0]?.city;
  const title = [p.publicName, specialties[0]].filter(Boolean).join(", ");
  const description =
    [p.summary, city ? `Atiende en ${[...new Set(p.locations.map((l) => l.city))].join(" y ")}.` : undefined]
      .filter(Boolean)
      .join(" ") || `Perfil de ${p.publicName} en Wattalis: servicios, sedes y contacto.`;
  return pageMetadata({
    title: p.isDemo ? `${title} (perfil ficticio)` : title,
    description,
    path: `/especialistas/${p.slug}`,
    // Los perfiles de demostración nunca se indexan.
    indexable: !p.isDemo,
  });
}

/** Reconstruye la búsqueda de origen solo con parámetros conocidos. */
function backHrefFrom(volver: string | string[] | undefined): string | null {
  const raw = Array.isArray(volver) ? volver[0] : volver;
  if (raw === undefined) return null;
  const params = Object.fromEntries(new URLSearchParams(raw));
  const query = parseDirectoryQuery(params);
  return `/especialistas${toSearchString(query, { pagina: query.pagina })}`;
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const p = await getProfessional(slug);
  if (!p) notFound();

  const backHref = backHrefFrom((await searchParams).volver);
  const area = getArea(p.areaId);
  const multi = p.locations.length > 1;
  const hasCredentials = Boolean(p.languages?.length || p.licenseNumber);
  const hasBackground = Boolean(p.education?.length || p.experience?.length);

  return (
    <div className="container profile-page">
      <nav aria-label="Regresar">
        {backHref ? (
          <Link className="back-link" href={backHref}>
            <ArrowLeftIcon />
            Volver a los resultados
          </Link>
        ) : (
          <Link className="back-link" href="/especialistas">
            <ArrowLeftIcon />
            Ir al directorio de especialistas
          </Link>
        )}
      </nav>

      <div className="profile-layout">
        <header className="profile-head">
          {p.isDemo && (
            <p className="notice">
              <InfoIcon />
              <span>
                <strong>Perfil ficticio de demostración.</strong> Ni la persona, ni el consultorio, ni
                sus datos de contacto existen.
              </span>
            </p>
          )}
          <div className="profile-identity">
            <Avatar professional={p} size={112} priority />
            <div className="profile-identity-text">
              <h1>{p.publicName}</h1>
              {(p.professionalTitle || specialtyNames(p).length > 0) && (
                <p className="title">
                  {[p.professionalTitle, specialtyNames(p).join(", ")].filter(Boolean).join(" · ")}
                </p>
              )}
              <div className="profile-tags">
                <AreaTag areaId={p.areaId} />
                {p.isDemo && <DemoTag />}
                {p.photo?.illustrative && <span className="tag">Retrato ilustrativo</span>}
              </div>
            </div>
          </div>
          <div className="profile-tools">
            <ShareButton path={`/especialistas/${p.slug}`} />
          </div>
        </header>

        <aside className="profile-aside" aria-labelledby="sedes-title">
          <section className="panel">
            <h2 id="sedes-title">{multi ? "Consultorios y contacto" : "Consultorio y contacto"}</h2>
            {p.locations.map((location) => (
              <LocationBlock
                key={location.id}
                location={location}
                hours={p.officeHours}
                demo={p.isDemo}
                headingLevel="h3"
              />
            ))}
            {p.isDemo && p.locations.some((l) => l.phone || l.email || l.street) && (
              <p className="muted" style={{ fontSize: "0.875rem", marginTop: 16 }}>
                En perfiles reales, el teléfono, el correo y la dirección se convierten en los botones
                «Llamar al consultorio», «Escribir al consultorio» y «Cómo llegar».
              </p>
            )}
          </section>
        </aside>

        <div className="profile-main">
          {p.services.length > 0 && (
            <section className="panel" aria-labelledby="servicios-title">
              <h2 id="servicios-title">Servicios</h2>
              {multi ? (
                p.locations.map((location) => {
                  const services = p.services.filter((s) => s.locationIds.includes(location.id));
                  if (services.length === 0) return null;
                  return (
                    <div key={location.id}>
                      <h3 className="panel-sub">En {location.name}</h3>
                      <ServiceList services={services} />
                    </div>
                  );
                })
              ) : (
                <ServiceList services={p.services} />
              )}
              {p.services.some((s) => s.priceMXN !== undefined) && (
                <p className="muted" style={{ fontSize: "0.875rem", marginTop: 16 }}>
                  Precios informativos en pesos mexicanos publicados por el consultorio. Confírmalos al
                  contactarlo.
                </p>
              )}
            </section>
          )}

          {p.bio && (
            <section className="panel" aria-labelledby="acerca-title">
              <h2 id="acerca-title">Acerca de</h2>
              <p>{p.bio}</p>
            </section>
          )}

          {hasBackground && (
            <section className="panel" aria-labelledby="formacion-title">
              <h2 id="formacion-title">Formación y trayectoria</h2>
              {p.education && p.education.length > 0 && (
                <>
                  <h3 className="panel-sub">Formación</h3>
                  <ul className="plain-list">
                    {p.education.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </>
              )}
              {p.experience && p.experience.length > 0 && (
                <>
                  <h3 className="panel-sub">Trayectoria</h3>
                  <ul className="plain-list">
                    {p.experience.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {hasCredentials && (
            <section className="panel" aria-labelledby="datos-title">
              <h2 id="datos-title">Datos profesionales</h2>
              <dl className="def-list">
                {p.languages && p.languages.length > 0 && (
                  <div>
                    <dt>Idiomas</dt>
                    <dd>{p.languages.join(", ")}</dd>
                  </div>
                )}
                {p.licenseNumber && (
                  <div>
                    <dt>Cédula profesional{p.isDemo ? " (ficticia)" : ""}</dt>
                    <dd>
                      {p.licenseNumber}
                      <span className="muted" style={{ display: "block", fontSize: "0.875rem" }}>
                        Dato publicado voluntariamente. Puedes consultarlo en el Registro Nacional de
                        Profesionistas de la SEP.
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {area && (
            <p className="muted" style={{ fontSize: "0.9375rem" }}>
              Explora más perfiles de{" "}
              <Link href={`/especialistas?area=${area.id}`}>{area.label.toLowerCase()}</Link>
              {p.specialtySlugs[0] && (
                <>
                  {" "}o de{" "}
                  <Link href={`/especialidades/${p.specialtySlugs[0]}`}>
                    {getSpecialty(p.specialtySlugs[0])?.name.toLowerCase()}
                  </Link>
                </>
              )}
              .
            </p>
          )}
        </div>
      </div>

      {!p.isDemo && <ProfileJsonLd professional={p} />}
    </div>
  );
}

function ServiceList({ services }: { services: PublicService[] }) {
  return (
    <ul className="service-list">
      {services.map((s) => (
        <li key={s.id}>
          <span className="name">{s.name}</span>
          {s.priceMXN !== undefined && <span className="price">{formatMXN(s.priceMXN)}</span>}
          {s.description && <span className="desc">{s.description}</span>}
          {s.durationMinutes !== undefined && (
            <span className="duration">Duración aproximada: {formatDuration(s.durationMinutes)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Datos estructurados solo para perfiles reales y con contenido visible.
 * No incluye reseñas, valoraciones ni disponibilidad.
 */
function ProfileJsonLd({ professional: p }: { professional: PublicProfessional }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.publicName,
    url: absoluteUrl(`/especialistas/${p.slug}`),
    ...(p.professionalTitle ? { jobTitle: p.professionalTitle } : {}),
    ...(p.summary ? { description: p.summary } : {}),
    knowsAbout: specialtyNames(p),
    workLocation: p.locations.map((l) => ({
      "@type": "Place",
      name: l.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: l.street,
        addressLocality: l.municipality,
        addressRegion: l.state,
        postalCode: l.postalCode,
        addressCountry: "MX",
      },
      ...(l.phone ? { telephone: l.phone } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      // El contenido proviene de campos publicados; se escapa «<» para evitar cierres de etiqueta.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

