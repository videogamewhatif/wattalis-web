import type { PublicLocation, PublicOfficeHours } from "@/lib/directory";
import { fullAddress, groupOfficeHours, mapHref, telHref } from "@/lib/format";
import { DirectionsIcon, MailIcon, PhoneIcon } from "./icons";

/**
 * Sede con dirección, horario de atención y contacto.
 * En perfiles ficticios se muestran los datos como texto, sin enlaces
 * de llamada, correo ni mapa.
 */
export function LocationBlock({
  location,
  hours,
  demo,
  headingLevel: Heading = "h3",
}: {
  location: PublicLocation;
  hours: PublicOfficeHours[];
  demo: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const rows = groupOfficeHours(hours, location.id);
  const hasContact = Boolean(location.phone || location.email);
  const canMap = Boolean(location.street);

  return (
    <div className="location">
      <div>
        <Heading>{location.name}</Heading>
        <address>
          {fullAddress(location)}
          {demo && location.street && <span className="muted"> (dirección ficticia)</span>}
        </address>
        {location.reference && <p className="reference">{location.reference}</p>}
      </div>

      {rows.length > 0 && (
        <div className="hours">
          <h4>Horario de atención</h4>
          <dl>
            {rows.map((r) => (
              <div key={r.days}>
                <dt>{r.days}</dt>
                <dd>{r.intervals.join(" y ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {demo ? (
        <div className="contact-demo">
          {hasContact && (
            <dl>
              {location.phone && (
                <div>
                  <dt>Teléfono ficticio:</dt>
                  <dd>{location.phone}</dd>
                </div>
              )}
              {location.email && (
                <div>
                  <dt>Correo ficticio:</dt>
                  <dd>{location.email}</dd>
                </div>
              )}
            </dl>
          )}
          {!hasContact && <p className="muted">Esta sede no publicó teléfono ni correo.</p>}
        </div>
      ) : (
        (hasContact || canMap) && (
          <div className="contact-actions">
            {location.phone && (
              <a className="btn btn-primary btn-block" href={telHref(location.phone)}>
                <PhoneIcon />
                Llamar al consultorio
                <span className="sr-only">: {location.phone}</span>
              </a>
            )}
            {location.email && (
              <a className="btn btn-secondary btn-block" href={`mailto:${location.email}`}>
                <MailIcon />
                Escribir al consultorio
              </a>
            )}
            {canMap && (
              <a
                className="btn btn-ghost btn-block"
                href={mapHref(location)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DirectionsIcon />
                Cómo llegar
                <span className="sr-only"> (abre un mapa externo en una pestaña nueva)</span>
              </a>
            )}
            {location.phone && <p className="muted" style={{ fontSize: "0.875rem" }}>Teléfono: {location.phone}</p>}
          </div>
        )
      )}
      {!demo && !hasContact && (
        <p className="muted" style={{ fontSize: "0.9375rem" }}>
          Esta sede no publicó teléfono ni correo.
        </p>
      )}
    </div>
  );
}
