import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  FolderIcon,
  ListIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";
import { pageMetadata } from "@/lib/seo";
import { salesContactHref, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Software para clínicas y consultorios",
  description:
    "Wattalis organiza la agenda, los profesionales, los pacientes, los servicios y la caja de hospitales, clínicas y consultorios en una sola aplicación.",
  path: "/para-clinicas",
});

const FEATURES = [
  {
    icon: CalendarIcon,
    title: "Agenda",
    items: [
      "Vista por día, por semana o en lista.",
      "Confirmación y reprogramación de citas.",
      "Registro de cambios de cada cita.",
    ],
  },
  {
    icon: ClockIcon,
    title: "Profesionales y horarios",
    items: [
      "Alta y gestión de profesionales.",
      "Horarios semanales por profesional.",
      "Bloqueos de horario.",
    ],
  },
  {
    icon: FolderIcon,
    title: "Pacientes",
    items: [
      "Directorio de pacientes dentro del sistema.",
      "Historial de citas de cada paciente.",
    ],
  },
  {
    icon: ListIcon,
    title: "Servicios",
    items: ["Catálogo de servicios con duración y precio."],
  },
  {
    icon: WalletIcon,
    title: "Caja",
    items: ["Apertura de caja.", "Registro de cobros y movimientos.", "Corte de caja."],
  },
  {
    icon: ShieldIcon,
    title: "Espacios de trabajo y roles",
    items: [
      "Espacios de trabajo para cada organización.",
      "Roles de Administración, Recepción y Profesional.",
    ],
  },
];

const ROLES = [
  {
    name: "Administración",
    text: "Pensado para quien configura y supervisa la operación del consultorio.",
  },
  {
    name: "Recepción",
    text: "Pensado para quien atiende la agenda y la caja en el día a día.",
  },
  {
    name: "Profesional",
    text: "Pensado para quien brinda la consulta o el servicio.",
  },
];

const PREVIEW_ROWS = [
  { hour: "09:00", slots: [{ who: "Paciente A", what: "Consulta general" }, null, { who: "Paciente C", what: "Limpieza dental" }] },
  { hour: "10:00", slots: [null, { who: "Paciente B", what: "Seguimiento" }, null] },
  { hour: "11:00", slots: [{ who: "Paciente D", what: "Primera vez" }, null, null] },
  { hour: "12:00", slots: [null, null, { who: "Paciente E", what: "Valoración" }] },
];

export default function ForClinicsPage() {
  const salesHref = salesContactHref();
  const salesIsExternal = salesHref.startsWith("mailto:");
  return (
    <>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container split">
          <div className="stack" style={{ gap: 20 }}>
            <p className="eyebrow">Wattalis para clínicas</p>
            <h1>Gestiona tu consultorio desde un solo lugar</h1>
            <p className="lead">
              Wattalis es una aplicación web para hospitales, clínicas y consultorios. Reúne la
              agenda, el equipo, los pacientes, los servicios y la caja para que recepción,
              administración y profesionales trabajen con la misma información.
            </p>
            <div className="cta-row">
              {salesIsExternal ? (
                <a className="btn btn-primary" href={salesHref}>
                  Contactar a Wattalis
                </a>
              ) : (
                <Link className="btn btn-primary" href={salesHref}>
                  Contactar a Wattalis
                </Link>
              )}
              {site.appUrl && (
                <a className="btn btn-secondary" href={site.appUrl}>
                  Acceso al sistema
                </a>
              )}
            </div>
            {site.appUrl && (
              <p className="muted" style={{ fontSize: "0.9375rem" }}>
                «Acceso al sistema» es para equipos que ya usan Wattalis.
              </p>
            )}
          </div>

          <figure style={{ margin: 0 }}>
            <div className="app-preview" aria-hidden="true">
              <div className="app-preview-bar">
                <span className="logo">
                  Wattalis
                  <span className="logo-dot" />
                </span>
                <span className="app-preview-tabs">
                  <span>Día</span>
                  <span>Semana</span>
                  <span>Lista</span>
                </span>
              </div>
              <div className="app-preview-body">
                <div className="hour col-head" />
                <div className="col-head">Consultorio 1</div>
                <div className="col-head">Consultorio 2</div>
                <div className="col-head">Dental</div>
                {PREVIEW_ROWS.map((row) => (
                  <PreviewRow key={row.hour} hour={row.hour} slots={row.slots} />
                ))}
              </div>
            </div>
            <figcaption className="muted" style={{ marginTop: 10, fontSize: "0.875rem" }}>
              Vista ilustrativa creada para este sitio, con datos ficticios.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section band" aria-labelledby="funciones-title">
        <div className="container">
          <div className="section-head">
            <h2 id="funciones-title">Lo que puedes hacer con Wattalis</h2>
            <p className="lead">Las herramientas para la operación diaria de tu consultorio.</p>
          </div>
          <ul className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, items }) => (
              <li key={title} className="feature">
                <span className="feature-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="roles-title">
        <div className="container">
          <div className="section-head">
            <h2 id="roles-title">Cada persona ve lo que necesita</h2>
            <p className="lead">
              Cada persona del equipo entra con uno de tres roles dentro del espacio de trabajo.
            </p>
          </div>
          <ul className="role-list">
            {ROLES.map((r) => (
              <li key={r.name}>
                <h3>
                  <UsersIcon style={{ width: 20, height: 20, display: "inline", verticalAlign: "-3px", marginRight: 8, color: "var(--brand-600)" }} />
                  {r.name}
                </h3>
                <p className="muted">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="directorio-title">
        <div className="container split">
          <div className="stack">
            <h2 id="directorio-title">Tu perfil en el directorio público</h2>
            <p className="lead">
              Los pacientes buscan especialistas en Wattalis por nombre, especialidad y ubicación.
              Cada consultorio decide qué publicar: servicios, sedes, horario de atención y medios de
              contacto.
            </p>
          </div>
          <ul className="plain-list" style={{ fontSize: "1.0625rem" }}>
            <li>La información de pacientes, citas y caja nunca se publica.</li>
            <li>Un perfil aparece solo cuando la clínica aprueba sus datos.</li>
            <li>Puedes retirar un perfil del directorio cuando lo decidas.</li>
          </ul>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-panel">
            <div className="stack" style={{ gap: 8 }}>
              <h2>¿Quieres conocer Wattalis para tu consultorio?</h2>
              <p className="lead">Escríbenos y te contamos cómo empezar.</p>
            </div>
            <div className="cta-row">
              {salesIsExternal ? (
                <a className="btn btn-primary" href={salesHref}>
                  Contactar a Wattalis
                </a>
              ) : (
                <Link className="btn btn-primary" href={salesHref}>
                  Contactar a Wattalis
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PreviewRow({
  hour,
  slots,
}: {
  hour: string;
  slots: ({ who: string; what: string } | null)[];
}) {
  return (
    <>
      <div className="hour">{hour}</div>
      {slots.map((slot, i) => (
        <div key={i}>
          {slot && (
            <span className="slot">
              {slot.who}
              <small>{slot.what}</small>
            </span>
          )}
        </div>
      ))}
    </>
  );
}
