import Link from "next/link";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container">
      <div className="not-found">
        <p className="code">ERROR 404</p>
        <h1>No encontramos esta página</h1>
        <p className="lead">
          Es posible que el enlace sea incorrecto o que el perfil ya no esté publicado en el
          directorio.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/especialistas">
            Ir al directorio de especialistas
          </Link>
          <Link className="btn btn-secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
