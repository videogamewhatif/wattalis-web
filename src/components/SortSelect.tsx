"use client";

import { useRouter } from "next/navigation";

/**
 * Selector de orden. Con JavaScript navega al cambiar; sin JavaScript
 * se usa el botón «Aplicar» del formulario GET que lo contiene.
 */
export function SortSelect({
  value,
  options,
  hrefFor,
}: {
  value: string;
  options: { value: string; label: string }[];
  hrefFor: Record<string, string>;
}) {
  const router = useRouter();
  return (
    <select
      id="orden"
      name="orden"
      className="select"
      defaultValue={value}
      onChange={(e) => router.push(hrefFor[e.target.value] ?? "/especialistas", { scroll: false })}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
