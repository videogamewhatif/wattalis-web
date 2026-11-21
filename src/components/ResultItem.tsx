import Link from "next/link";
import { getSpecialty, type PublicProfessional } from "@/lib/directory";
import { formatMXN, shortPlace } from "@/lib/format";
import { AreaTag, DemoTag } from "./AreaTag";
import { Avatar } from "./Avatar";
import { ArrowRightIcon, PinIcon } from "./icons";

/** Resultado del directorio. `returnTo` permite volver a esta búsqueda. */
export function ResultItem({
  professional,
  returnTo,
}: {
  professional: PublicProfessional;
  returnTo: string;
}) {
  const href = `/especialistas/${professional.slug}${
    returnTo ? `?volver=${encodeURIComponent(returnTo)}` : ""
  }`;
  const specialties = professional.specialtySlugs.flatMap((s) => getSpecialty(s)?.name ?? []);
  const places = [...new Set(professional.locations.map(shortPlace))];
  const multi = professional.locations.length > 1;
  const services = professional.services
    // En perfiles con varias sedes, se evita repetir el mismo servicio.
    .filter((s, i, all) => all.findIndex((x) => x.name === s.name) === i)
    .slice(0, 2);
  const locationName = (id: string) => professional.locations.find((l) => l.id === id)?.name;

  return (
    <li>
      <article className="result">
        <div className="result-main">
          <Avatar professional={professional} size={72} />
          <div className="result-info">
            <h2>
              <Link href={href}>{professional.publicName}</Link>
            </h2>
            <p className="result-meta">
              <span>{specialties.join(" · ")}</span>
            </p>
            <div className="profile-tags">
              <AreaTag areaId={professional.areaId} />
              {professional.isDemo && <DemoTag />}
            </div>
            <p className="result-place">
              <PinIcon />
              {places.join(" · ")}
              {multi && ` (${professional.locations.length} sedes)`}
            </p>
          </div>
        </div>
        {services.length > 0 && (
          <ul className="result-services" aria-label="Algunos servicios">
            {services.map((s) => {
              const priced = professional.services.filter((x) => x.name === s.name && x.priceMXN !== undefined);
              const single = priced.length === 1 ? priced[0] : undefined;
              const where =
                multi && single ? single.locationIds.map(locationName).filter(Boolean).join(", ") : undefined;
              return (
                <li key={s.id}>
                  <span>
                    {s.name}
                    {where && <span className="muted"> · {where}</span>}
                  </span>
                  {priced.length === 1 && single?.priceMXN !== undefined && (
                    <span className="price">{formatMXN(single.priceMXN)}</span>
                  )}
                  {priced.length > 1 && (
                    <span className="price">
                      Desde {formatMXN(Math.min(...priced.map((x) => x.priceMXN!)))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="result-actions">
          <Link className="btn btn-secondary btn-sm" href={href} aria-label={`Ver perfil de ${professional.publicName}`}>
            Ver perfil
            <ArrowRightIcon />
          </Link>
        </div>
      </article>
    </li>
  );
}
