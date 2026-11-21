import type { PublicLocation, PublicOfficeHours, Weekday } from "@/lib/directory";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/** Precio en pesos mexicanos, p. ej. «$850 MXN». */
export function formatMXN(amount: number): string {
  const formatted = Number.isInteger(amount)
    ? currency.format(amount)
    : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  return `${formatted} MXN`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export interface HoursRow {
  days: string;
  intervals: string[];
}

/**
 * Agrupa el horario de una sede en filas legibles y une días consecutivos
 * con el mismo horario: «Lunes a viernes · 09:00–14:00».
 */
export function groupOfficeHours(hours: PublicOfficeHours[], locationId: string): HoursRow[] {
  const byDay = new Map<Weekday, string[]>();
  for (const h of hours.filter((x) => x.locationId === locationId)) {
    const list = byDay.get(h.day) ?? [];
    list.push(`${h.opens}–${h.closes}`);
    byDay.set(h.day, list);
  }
  const days = [...byDay.keys()].sort((a, b) => a - b);
  const rows: { from: Weekday; to: Weekday; key: string; intervals: string[] }[] = [];
  for (const day of days) {
    const intervals = byDay.get(day)!.sort();
    const key = intervals.join("|");
    const last = rows.at(-1);
    if (last && last.key === key && last.to === day - 1) last.to = day;
    else rows.push({ from: day, to: day, key, intervals });
  }
  return rows.map((r) => ({
    days:
      r.from === r.to
        ? WEEKDAY_NAMES[r.from]
        : r.to - r.from === 1
          ? `${WEEKDAY_NAMES[r.from]} y ${WEEKDAY_NAMES[r.to].toLowerCase()}`
          : `${WEEKDAY_NAMES[r.from]} a ${WEEKDAY_NAMES[r.to].toLowerCase()}`,
    intervals: r.intervals,
  }));
}

/** Ubicación resumida para tarjetas: «Coyoacán, Ciudad de México». */
export function shortPlace(location: PublicLocation): string {
  return location.municipality === location.state
    ? location.state
    : `${location.municipality}, ${location.state}`;
}

export function fullAddress(location: PublicLocation): string {
  return [
    location.street,
    location.neighborhood ? `Col. ${location.neighborhood}` : undefined,
    location.postalCode ? `C.P. ${location.postalCode}` : undefined,
    location.municipality,
    location.state,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Enlace tel: con lada de México. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `tel:+52${digits}` : `tel:${digits}`;
}

export function mapHref(location: PublicLocation): string {
  const query = [location.name, fullAddress(location)].join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 2 ? parts[parts.length - 2][0] : (parts[1]?.[0] ?? "");
  return (first + second).toUpperCase();
}
