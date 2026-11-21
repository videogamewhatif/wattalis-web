import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Nosotros",
  description:
    "Wattalis reúne un directorio para explorar opciones de atención de la salud y un software para operar clínicas y consultorios.",
  path: "/nosotros",
});

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <p className="eyebrow">Nosotros</p>
        <h1>Conectamos a pacientes con consultorios mejor organizados</h1>
      </header>
      <div className="prose">
        <p>
          Wattalis tiene dos partes que trabajan juntas: un directorio público para que los
          pacientes encuentren especialistas de la salud y un software para que clínicas y
          consultorios organicen su operación diaria.
        </p>
        <h2>Para pacientes</h2>
        <p>
          En el <Link href="/especialistas">directorio</Link> puedes buscar por nombre,
          especialidad o ubicación, revisar los servicios que cada consultorio publica, sus sedes y
          su horario de atención, y encontrar sus datos de contacto para comunicarte directamente.
        </p>
        <p>
          Wattalis no agenda citas, no ofrece orientación médica y no intermedia pagos. La relación
          de atención es entre cada paciente y su consultorio.
        </p>
        <h2>Para clínicas y consultorios</h2>
        <p>
          El <Link href="/para-clinicas">software de gestión</Link> reúne agenda, profesionales,
          horarios, pacientes, servicios y caja en una aplicación web con roles de Administración,
          Recepción y Profesional.
        </p>
        <h2>Cómo cuidamos la información</h2>
        <ul>
          <li>Cada consultorio decide qué datos de su perfil se publican.</li>
          <li>
            El directorio no muestra información de pacientes, citas, cobros ni notas internas.
          </li>
          <li>Un perfil puede retirarse del directorio en cualquier momento.</li>
        </ul>
      </div>
    </div>
  );
}
