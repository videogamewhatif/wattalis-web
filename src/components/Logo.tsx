import Link from "next/link";

/** Logotipo tipográfico provisional: «Wattalis» con punto ámbar. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={["logo", className].filter(Boolean).join(" ")} aria-label="Wattalis, ir al inicio">
      Wattalis
      <span className="logo-dot" aria-hidden="true" />
    </Link>
  );
}
