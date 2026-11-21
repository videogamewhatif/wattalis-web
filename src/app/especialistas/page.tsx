import type { Metadata } from "next";
import Link from "next/link";
import { ResultItem } from "@/components/ResultItem";
import { SearchForm } from "@/components/SearchForm";
import { SortSelect } from "@/components/SortSelect";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  InfoIcon,
} from "@/components/icons";
import {
  getArea,
  getSpecialty,
  getSuggestionCatalog,
  hasTextQuery,
  parseDirectoryQuery,
  searchDirectory,
  toSearchString,
  type DirectoryQuery,
  type FacetOption,
  type SearchResult,
} from "@/lib/directory";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/especialistas">;

function describe(query: DirectoryQuery): string | undefined {
  const parts = [
    query.q,
    query.especialidad ? getSpecialty(query.especialidad)?.name : query.area ? getArea(query.area)?.label : undefined,
    query.ubicacion,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = await searchParams;
  const query = parseDirectoryQuery(raw);
  const summary = describe(query);
  // Las combinaciones de búsqueda y filtros no se indexan; la URL canónica
  // es siempre el directorio general.
  const hasParams = Object.values(raw).some((v) => v !== undefined && v !== "");
  return pageMetadata({
    title: summary ? `Especialistas: ${summary}` : "Buscar especialistas",
    description:
      "Directorio de especialistas de la salud. Filtra por área, especialidad y ubicación, y consulta servicios, sedes y datos de contacto de cada consultorio.",
    path: "/especialistas",
    indexable: !hasParams,
  });
}

export default async function DirectoryPage({ searchParams }: Props) {
  const query = parseDirectoryQuery(await searchParams);
  const [result, suggestions] = await Promise.all([searchDirectory(query), getSuggestionCatalog()]);

  const href = (changes: Parameters<typeof toSearchString>[1]) =>
    `/especialistas${toSearchString(query, changes)}`;
  // Búsqueda actual con la página efectiva; se usa para volver desde un perfil.
  const current = toSearchString(query, { pagina: result.page }).replace(/^\?/, "");
  const textual = hasTextQuery(query);
  const cityLabel = (slug: string) =>
    result.facets.cities.find((c) => c.value === slug)?.label ?? slug.replace(/-/g, " ");

  const chips: { label: string; href: string }[] = [];
  if (query.q) chips.push({ label: `«${query.q}»`, href: href({ q: undefined }) });
  if (query.ubicacion) chips.push({ label: `Ubicación: ${query.ubicacion}`, href: href({ ubicacion: undefined }) });
  if (query.area)
    chips.push({
      label: `Área: ${getArea(query.area)?.label}`,
      href: href({ area: undefined, especialidad: undefined }),
    });
  if (query.especialidad)
    chips.push({
      label: `Especialidad: ${getSpecialty(query.especialidad)?.name}`,
      href: href({ especialidad: undefined }),
    });
  if (query.ciudad) chips.push({ label: `Ciudad: ${cityLabel(query.ciudad)}`, href: href({ ciudad: undefined }) });

  const filterCount = [query.area, query.especialidad, query.ciudad].filter(Boolean).length;
  const hasDemo = result.items.some((p) => p.isDemo);

  return (
    <div className="container">
      <header className="page-head page-head--tight">
        <h1>Especialistas</h1>
        <SearchForm
          key={`${query.q}|${query.ubicacion}`}
          compact
          suggestions={suggestions}
          initialQ={query.q}
          initialUbicacion={query.ubicacion}
          preserve={{
            area: query.area,
            especialidad: query.especialidad,
            ciudad: query.ciudad,
            orden: query.orden === "alfabetico" ? "alfabetico" : undefined,
          }}
          label="Buscar en el directorio"
        />
      </header>

      <div className="directory" style={{ marginTop: 16 }}>
        {/* Escritorio: columna de filtros. Móvil: panel plegable. */}
        <aside className="filters-desktop" aria-label="Filtros">
          <FilterPanel query={query} result={result} href={href} />
        </aside>

        <section aria-labelledby="results-title">
          <details className="filters filters-mobile">
            <summary>
              <span>Filtros{filterCount > 0 ? ` (${filterCount})` : ""}</span>
              <ChevronDownIcon />
            </summary>
            <div className="filters-body">
              <FilterPanel query={query} result={result} href={href} />
            </div>
          </details>

          <div className="results-bar">
            <h2 id="results-title" className="results-count" aria-live="polite">
              {result.total === 0
                ? "Sin resultados"
                : `${result.total} ${result.total === 1 ? "especialista" : "especialistas"}`}
            </h2>
            {result.total > 1 &&
              (textual ? (
                <form className="sort-form" action="/especialistas" method="get">
                  <label htmlFor="orden">Orden</label>
                  {(["q", "ubicacion", "area", "especialidad", "ciudad"] as const).map((k) =>
                    query[k] ? <input key={k} type="hidden" name={k} value={query[k]} /> : null,
                  )}
                  <SortSelect
                    key={query.orden}
                    value={query.orden}
                    options={[
                      { value: "relevancia", label: "Mayor coincidencia" },
                      { value: "alfabetico", label: "Alfabético (A–Z)" },
                    ]}
                    hrefFor={{
                      relevancia: href({ orden: "relevancia" }),
                      alfabetico: href({ orden: "alfabetico" }),
                    }}
                  />
                  <noscript>
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Aplicar
                    </button>
                  </noscript>
                </form>
              ) : (
                <p className="muted">Orden alfabético</p>
              ))}
          </div>

          {chips.length > 0 && (
            <ul className="chips" aria-label="Criterios aplicados">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <Link className="chip" href={chip.href} aria-label={`Quitar ${chip.label}`}>
                    {chip.label}
                    <CloseIcon />
                  </Link>
                </li>
              ))}
              {chips.length > 1 && (
                <li>
                  <Link className="chip-clear" href="/especialistas">
                    Limpiar todo
                  </Link>
                </li>
              )}
            </ul>
          )}

          {hasDemo && (
            <p className="notice notice-compact">
              <InfoIcon />
              <span>Demostración: perfiles y datos de contacto ficticios.</span>
            </p>
          )}

          {result.total === 0 ? (
            <EmptyState query={query} href={href} />
          ) : (
            <>
              <ul className="result-list">
                {result.items.map((p) => (
                  <ResultItem key={p.id} professional={p} returnTo={current} />
                ))}
              </ul>
              <Pagination result={result} href={href} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

type HrefFn = (changes: Parameters<typeof toSearchString>[1]) => string;

function FilterPanel({ query, result, href }: { query: DirectoryQuery; result: SearchResult; href: HrefFn }) {
  return (
    <div className="stack" style={{ gap: 24 }}>
      <FilterGroup
        title="Área"
        options={result.facets.areas}
        selected={query.area}
        hrefFor={(value) =>
          value === query.area
            ? href({ area: undefined, especialidad: undefined })
            : href({
                area: value,
                especialidad:
                  query.especialidad && getSpecialty(query.especialidad)?.areaId === value
                    ? query.especialidad
                    : undefined,
              })
        }
      />
      <FilterGroup
        title="Especialidad"
        options={result.facets.specialties}
        selected={query.especialidad}
        hrefFor={(value) =>
          value === query.especialidad
            ? href({ especialidad: undefined })
            : href({ especialidad: value, area: getSpecialty(value)?.areaId })
        }
      />
      <FilterGroup
        title="Ciudad"
        options={result.facets.cities}
        selected={query.ciudad}
        hrefFor={(value) => (value === query.ciudad ? href({ ciudad: undefined }) : href({ ciudad: value }))}
      />
    </div>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  hrefFor,
}: {
  title: string;
  options: FacetOption[];
  selected?: string;
  hrefFor: (value: string) => string;
}) {
  if (options.length === 0) return null;
  return (
    <nav className="filter-group" aria-label={`Filtrar por ${title.toLowerCase()}`}>
      <h2>{title}</h2>
      <ul className="filter-options">
        {options.map((o) => {
          const active = o.value === selected;
          return (
            <li key={o.value}>
              <Link
                href={hrefFor(o.value)}
                aria-current={active ? "true" : undefined}
                scroll={false}
              >
                <span className="label">
                  <CheckIcon className="check" />
                  {o.label}
                  {active && <span className="sr-only"> (seleccionado, elige para quitar)</span>}
                </span>
                <span className="count">{o.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function EmptyState({ query, href }: { query: DirectoryQuery; href: HrefFn }) {
  const hasFilters = Boolean(query.area || query.especialidad || query.ciudad);
  return (
    <div className="empty-state">
      <h3>No encontramos especialistas con esos criterios</h3>
      <ul>
        <li>Revisa la ortografía o usa un término más general, como «psicología».</li>
        {query.ubicacion && <li>Prueba con una ciudad o municipio cercano.</li>}
        {hasFilters && <li>Quita alguno de los filtros aplicados.</li>}
      </ul>
      <div className="empty-actions">
        {query.ubicacion && query.q && (
          <Link className="btn btn-primary btn-sm" href={href({ ubicacion: undefined })}>
            Buscar «{query.q}» en todas las ubicaciones
          </Link>
        )}
        {hasFilters && (
          <Link
            className="btn btn-secondary btn-sm"
            href={href({ area: undefined, especialidad: undefined, ciudad: undefined })}
          >
            Quitar filtros
          </Link>
        )}
        <Link className="btn btn-secondary btn-sm" href="/especialistas">
          Ver todos los especialistas
        </Link>
      </div>
    </div>
  );
}

function Pagination({ result, href }: { result: SearchResult; href: HrefFn }) {
  if (result.pageCount <= 1) return null;
  // Primera, última y vecinas de la actual; el resto se resume con «…».
  const wanted = [...new Set([1, result.page - 1, result.page, result.page + 1, result.pageCount])]
    .filter((n) => n >= 1 && n <= result.pageCount)
    .sort((a, b) => a - b);
  const pages: (number | "gap")[] = [];
  wanted.forEach((n, i) => {
    if (i > 0 && n - wanted[i - 1] > 1) pages.push("gap");
    pages.push(n);
  });
  return (
    <nav className="pagination" aria-label="Paginación de resultados">
      <ul>
        <li>
          {result.page > 1 ? (
            <Link href={href({ pagina: result.page - 1 })} rel="prev">
              <ChevronLeftIcon />
              Anterior
            </Link>
          ) : (
            <span className="disabled" aria-hidden="true">
              <ChevronLeftIcon />
              Anterior
            </span>
          )}
        </li>
        {pages.map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true">
              <span>…</span>
            </li>
          ) : (
          <li key={n}>
            <Link
              href={href({ pagina: n })}
              aria-current={n === result.page ? "page" : undefined}
              aria-label={`Página ${n}`}
            >
              {n}
            </Link>
          </li>
          ),
        )}
        <li>
          {result.page < result.pageCount ? (
            <Link href={href({ pagina: result.page + 1 })} rel="next">
              Siguiente
              <ChevronRightIcon />
            </Link>
          ) : (
            <span className="disabled" aria-hidden="true">
              Siguiente
              <ChevronRightIcon />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
