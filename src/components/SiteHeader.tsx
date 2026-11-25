import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { SearchIcon } from "./icons";
import "./SiteHeader.css";

/**
 * Encabezado separado por público: a la izquierda, pacientes; a la derecha,
 * tras una línea divisoria, clínicas y profesionales (software, planes y acceso).
 */
const PATIENTS = [{ href: "/especialistas", label: "Encontrar especialista" }];
const CLINICS = [
  { href: "/para-clinicas", label: "¿Tienes una clínica?" },
  { href: "/planes", label: "Planes" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />
        <nav className="site-nav site-nav--split" aria-label="Principal">
          <div className="site-nav-group" role="group" aria-label="Pacientes">
            {PATIENTS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="site-nav-group site-nav-group--clinics" role="group" aria-label="Clínicas y profesionales">
            {CLINICS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            {site.appUrl && (
              <a className="btn btn-secondary" href={site.appUrl}>
                Acceso al sistema
              </a>
            )}
          </div>
        </nav>
        <div className="header-mobile">
          <Link className="icon-btn" href="/especialistas">
            <SearchIcon />
            Buscar
          </Link>
          <MobileMenu>
            <p className="mobile-menu-title">Pacientes</p>
            {PATIENTS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            <hr />
            <p className="mobile-menu-title">Clínicas y profesionales</p>
            {CLINICS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            {site.appUrl && <a href={site.appUrl}>Acceso al sistema</a>}
            <hr />
            <NavLink href="/nosotros">Nosotros</NavLink>
            <NavLink href="/contacto">Contacto</NavLink>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
