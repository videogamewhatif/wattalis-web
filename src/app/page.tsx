import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { SearchForm } from "@/components/SearchForm";
import { ArrowRightIcon, CalendarIcon, UsersIcon, ListIcon, WalletIcon } from "@/components/icons";
import {
  AREA_COLOR_VAR,
  getFeaturedProfessionals,
  getPublishedCatalog,
  getSuggestionCatalog,
} from "@/lib/directory";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const CLINIC_FEATURES = [
  {
    icon: CalendarIcon,
    title: "Agenda",
    text: "Citas por día, semana o lista, con confirmación y reprogramación.",
  },
  {
    icon: UsersIcon,
    title: "Profesionales",
    text: "Horarios semanales y bloqueos de cada persona del equipo.",
  },
  {
    icon: ListIcon,
    title: "Servicios",
    text: "Catálogo con duración y precio de cada servicio.",
  },
  {
    icon: WalletIcon,
    title: "Caja",
    text: "Apertura, cobros, movimientos y corte del día.",
  },
];

export default async function HomePage() {
  const [catalog, featured, suggestions] = await Promise.all([
    getPublishedCatalog(),
    getFeaturedProfessionals(4),
    getSuggestionCatalog(),
  ]);
  const showDemoLabel = featured.some((p) => p.isDemo);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">Encuentra a tu próximo especialista</h1>
            <p className="lead">
              Busca por nombre, especialidad o ubicación y conoce cómo contactar a cada consultorio.
            </p>
            <SearchForm suggestions={suggestions} />
            <p className="muted" style={{ fontSize: "0.9375rem" }}>
              ¿No sabes por dónde empezar? <Link href="/especialidades">Explora las especialidades</Link>.
            </p>
          </div>
          <figure className="hero-media" style={{ margin: 0 }}>
            <Image
              src="/ilustraciones/consultorio.svg"
              alt="Ilustración de un consultorio luminoso con escritorio, sillas y una planta"
              width={960}
              height={760}
              priority
              sizes="(min-width: 960px) 50vw, 100vw"
            />
          </figure>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="areas-title">
        <div className="container">
          <div className="section-head">
            <h2 id="areas-title">Áreas de atención</h2>
            <p className="lead">Elige un área para ver a los especialistas que atienden en ella.</p>
          </div>
          <ul className="area-list">
            {catalog.map(({ area, count }) => (
              <li key={area.id}>
                <Link
                  href={`/especialistas?area=${area.id}`}
                  className="area-link"
                  style={{ "--area-color": AREA_COLOR_VAR[area.id] } as CSSProperties}
                >
                  <strong>
                    {area.label}
                    <ArrowRightIcon />
                  </strong>
                  <span>{area.description}</span>
                  <span>
                    {count} {count === 1 ? "especialista" : "especialistas"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="perfiles-title">
          <div className="container">
            <div className="section-head">
              <h2 id="perfiles-title">{showDemoLabel ? "Perfiles de ejemplo" : "Perfiles para explorar"}</h2>
              <p className="lead">
                {showDemoLabel
                  ? "Estos perfiles son ficticios y muestran cómo se verá la información de cada consultorio."
                  : "Conoce a algunos de los especialistas que publican su perfil en Wattalis."}
              </p>
            </div>
            <ul className="profile-grid">
              {featured.map((p) => (
                <li key={p.id}>
                  <ProfessionalCard professional={p} />
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 24 }}>
              <Link className="link-arrow" href="/especialistas">
                Ver todos los especialistas
                <ArrowRightIcon />
              </Link>
            </p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="clinicas-title">
        <div className="container">
          <div className="clinics-band">
            <div className="clinics-band-grid">
              <div className="stack">
                <p className="eyebrow">Wattalis para clínicas</p>
                <h2 id="clinicas-title">Gestiona tu consultorio desde un solo lugar</h2>
                <p>
                  Hospitales, clínicas y consultorios usan Wattalis para organizar la agenda, el
                  equipo, los servicios y la caja en una sola aplicación.
                </p>
                <div className="cta-row" style={{ marginTop: 8 }}>
                  <Link className="btn btn-on-dark" href="/para-clinicas">
                    Conocer Wattalis
                    <ArrowRightIcon />
                  </Link>
                </div>
              </div>
              <ul className="feature-list">
                {CLINIC_FEATURES.map(({ icon: Icon, title, text }) => (
                  <li key={title}>
                    <Icon />
                    <span>
                      <strong>{title}</strong>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
