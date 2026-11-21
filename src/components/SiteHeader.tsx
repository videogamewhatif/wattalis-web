import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { SearchIcon } from "./icons";

const NAV = [
  { href: "/especialistas", label: "Buscar especialistas" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/para-clinicas", label: "Para clínicas" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />
        <nav className="site-nav" aria-label="Principal">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          {site.appUrl && (
            <a className="btn btn-secondary" href={site.appUrl}>
              Acceso al sistema
            </a>
          )}
        </nav>
        <div className="header-mobile">
          <Link className="icon-btn" href="/especialistas">
            <SearchIcon />
            Buscar
          </Link>
          <MobileMenu>
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            <NavLink href="/nosotros">Nosotros</NavLink>
            <NavLink href="/contacto">Contacto</NavLink>
            {site.appUrl && (
              <>
                <hr />
                <a href={site.appUrl}>Acceso al sistema</a>
              </>
            )}
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
