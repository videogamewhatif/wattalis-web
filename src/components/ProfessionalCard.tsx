import Link from "next/link";
import { getSpecialty, type PublicProfessional } from "@/lib/directory";
import { shortPlace } from "@/lib/format";
import { AreaTag, DemoTag } from "./AreaTag";
import { Avatar } from "./Avatar";

/** Tarjeta compacta para la portada y las páginas de especialidad. */
export function ProfessionalCard({
  professional,
  headingLevel: Heading = "h3",
}: {
  professional: PublicProfessional;
  headingLevel?: "h2" | "h3";
}) {
  const specialty = getSpecialty(professional.specialtySlugs[0] ?? "");
  const place = professional.locations[0];
  return (
    <article className="profile-card">
      <div className="profile-card-top">
        <Avatar professional={professional} size={60} />
        <div>
          <Heading>
            <Link href={`/especialistas/${professional.slug}`}>{professional.publicName}</Link>
          </Heading>
          {specialty && <p className="meta">{specialty.name}</p>}
        </div>
      </div>
      <div className="profile-tags">
        <AreaTag areaId={professional.areaId} />
        {professional.isDemo && <DemoTag />}
      </div>
      {place && (
        <p className="meta">
          {shortPlace(place)}
          {professional.locations.length > 1 && ` y ${professional.locations.length - 1} sede más`}
        </p>
      )}
      <span className="cta" aria-hidden="true">
        Ver perfil →
      </span>
    </article>
  );
}
