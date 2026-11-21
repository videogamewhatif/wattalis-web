import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { AREA_COLOR_VAR, getPublishedCatalog } from "@/lib/directory";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Especialidades",
  description:
    "Explora las áreas de atención y especialidades disponibles en el directorio Wattalis: atención médica, nutrición, psicología, odontología y óptica.",
  path: "/especialidades",
});

export default async function SpecialtiesPage() {
  const catalog = await getPublishedCatalog();
  return (
    <div className="container" style={{ paddingBottom: 72 }}>
      <header className="page-head">
        <h1>Especialidades</h1>
        <p className="lead" style={{ maxWidth: 640 }}>
          Cada área agrupa especialidades relacionadas. Solo aparecen las que tienen perfiles
          publicados en el directorio.
        </p>
      </header>

      {catalog.map(({ area, count, specialties }) => (
        <section
          key={area.id}
          className="area-section"
          aria-labelledby={`area-${area.id}`}
          style={{ "--area-color": AREA_COLOR_VAR[area.id] } as CSSProperties}
        >
          <div className="area-section-head">
            <div className="stack" style={{ gap: 4 }}>
              <h2 id={`area-${area.id}`}>{area.label}</h2>
              <p className="muted">{area.description}</p>
            </div>
            <Link className="link-arrow" href={`/especialistas?area=${area.id}`}>
              Ver {count} {count === 1 ? "especialista" : "especialistas"} de {area.label.toLowerCase()}
              <ArrowRightIcon />
            </Link>
          </div>
          <ul className="specialty-links">
            {specialties.map((s) => (
              <li key={s.slug}>
                <Link href={`/especialidades/${s.slug}`}>
                  {s.name}
                  <span className="count">
                    {s.count} {s.count === 1 ? "perfil" : "perfiles"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
