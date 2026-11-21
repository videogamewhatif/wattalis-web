"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "./icons";

/** Menú desplegable para móvil basado en <details>, accesible por teclado. */
export function MobileMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // Cierra el menú al navegar.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <details className="mobile-menu" ref={ref}>
      <summary className="icon-btn" aria-label="Menú">
        <MenuIcon className="when-closed" />
        <CloseIcon className="when-open" />
      </summary>
      <nav className="mobile-menu-panel" aria-label="Principal">
        {children}
      </nav>
    </details>
  );
}
