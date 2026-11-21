import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { ArrowRightIcon } from "@/components/icons";
import { getPublishedCatalog, getSpecialtyPage } from "@/lib/directory";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/especialidades/[slug]">;

const PREVIEW = 6;

export async function generateStaticParams() {
  const catalog = await getPublishedCatalog();
  return catalog.flatMap((g) => g.specialties.map((s) => ({ slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSpecialtyPage(slug);
  if (!page) return { title: "Especialidad no encontrada", robots: { index: false, follow: false } };
  return pageMetadata({
    title: page.specialty.name,
    description: `${page.specialty.description} Encuentra especialistas en ${page.specialty.name.toLowerCase()} y consulta sus servicios, sedes y contacto.`,
    path: `/especialidades/${slug}`,
    // Una especialidad formada solo por perfiles ficticios no se indexa.
    indexable: page.professionals.some((p) => !p.isDemo),
  });
}

export default async function SpecialtyPage({ params }: Props) {
  const { slug } = await params;
  const page = await getSpecialtyPage(slug);
  if (!page) notFound();
  const { specialty, area, professionals } = page;
  const catalog = await getPublishedCatalog();
  const related =
    catalog.find((g) => g.area.id === area.id)?.specialties.filter((s) => s.slug !== slug) ?? [];
  const total = professionals.length;

  return (
    <div className="container" style={{ paddingBottom: 72 }}>
      <header className="page-head">
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <ol>
            <li>
              <Link href="/especialidades">Especialidades</Link>
            </li>
            <li>
              <Link href={`/especialistas?area=${area.id}`}>{area.label}</Link>
            </li>
            <li aria-current="page">{specialty.name}</li>
          </ol>
        </nav>
        <h1>{specialty.name}</h1>
        <p className="lead" style={{ maxWidth: 640 }}>
          {specialty.description}
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href={`/especialistas?especialidad=${specialty.slug}`}>
            Ver {total === 1 ? "el especialista" : `los ${total} especialistas`}
            <ArrowRightIcon />
          </Link>
        </div>
      </header>

      <section aria-labelledby="perfiles-title" style={{ marginTop: 16 }}>
        <h2 id="perfiles-title" className="sr-only">
          Perfiles de {specialty.name.toLowerCase()}
        </h2>
        {professionals.some((p) => p.isDemo) && (
          <p className="muted" style={{ marginBottom: 16 }}>
            Perfiles ficticios de demostración.
          </p>
        )}
        <ul className="profile-grid">
          {professionals.slice(0, PREVIEW).map((p) => (
            <li key={p.id}>
              <ProfessionalCard professional={p} />
            </li>
          ))}
        </ul>
        {total > PREVIEW && (
          <p style={{ marginTop: 20 }}>
            <Link className="link-arrow" href={`/especialistas?especialidad=${specialty.slug}`}>
              Ver los {total} resultados
              <ArrowRightIcon />
            </Link>
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section aria-labelledby="relacionadas-title" style={{ marginTop: 56 }}>
          <h2 id="relacionadas-title" style={{ fontSize: "1.375rem", marginBottom: 16 }}>
            Otras especialidades de {area.label.toLowerCase()}
          </h2>
          <ul className="specialty-links">
            {related.map((s) => (
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
      )}
    </div>
  );
}
