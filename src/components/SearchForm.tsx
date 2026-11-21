"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { normalizeText } from "@/lib/directory/normalize";
import { PinIcon, SearchIcon } from "./icons";

export interface Suggestion {
  label: string;
  hint: string;
}

interface SearchFormProps {
  suggestions: { terms: Suggestion[]; places: Suggestion[] };
  initialQ?: string;
  initialUbicacion?: string;
  /** Filtros que se conservan al cambiar el texto (área, especialidad…). */
  preserve?: Record<string, string | undefined>;
  compact?: boolean;
  /** Etiqueta accesible del formulario. */
  label?: string;
}

const MAX_SUGGESTIONS = 6;

/**
 * Buscador de dos campos. Funciona sin JavaScript como formulario GET;
 * con JavaScript añade sugerencias navegables por teclado y URL limpias.
 */
export function SearchForm({
  suggestions,
  initialQ = "",
  initialUbicacion = "",
  preserve = {},
  compact = false,
  label = "Buscar especialistas",
}: SearchFormProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [ubicacion, setUbicacion] = useState(initialUbicacion);
  const id = useId();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const qValue = q.trim();
    const uValue = ubicacion.trim();
    if (qValue) params.set("q", qValue);
    if (uValue) params.set("ubicacion", uValue);
    for (const [key, value] of Object.entries(preserve)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    router.push(`/especialistas${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      role="search"
      aria-label={label}
      action="/especialistas"
      method="get"
      onSubmit={onSubmit}
      className={compact ? "search-panel search-panel--compact" : "search-panel"}
    >
      <div className="search-fields">
        <Combobox
          id={`${id}-q`}
          name="q"
          label="Nombre o especialidad"
          placeholder="Ej. psicología o pediatría"
          value={q}
          onChange={setQ}
          options={suggestions.terms}
          icon={<SearchIcon />}
        />
        <Combobox
          id={`${id}-u`}
          name="ubicacion"
          label="Ciudad, municipio o código postal"
          placeholder="Ej. Guadalajara o 06700"
          value={ubicacion}
          onChange={setUbicacion}
          options={suggestions.places}
          icon={<PinIcon />}
        />
        {Object.entries(preserve).map(([key, value]) =>
          value ? <input key={key} type="hidden" name={key} value={value} /> : null,
        )}
        <button type="submit" className="btn btn-primary search-submit">
          {compact ? "Buscar" : "Buscar especialistas"}
        </button>
      </div>
    </form>
  );
}

interface ComboboxProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Suggestion[];
  icon: ReactNode;
}

/** Combobox con lista de sugerencias (patrón ARIA 1.2). */
function Combobox({ id, name, label, placeholder, value, onChange, options, icon }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${id}-list`;

  const matches = useMemo(() => {
    const needle = normalizeText(value);
    if (!needle) return [];
    const scored: { s: Suggestion; rank: number }[] = [];
    for (const s of options) {
      const hay = normalizeText(s.label);
      if (hay === needle) continue;
      const words = hay.split(" ");
      const rank = hay.startsWith(needle) ? 0 : words.some((w) => w.startsWith(needle)) ? 1 : hay.includes(needle) ? 2 : -1;
      if (rank >= 0) scored.push({ s, rank });
    }
    return scored
      .sort((a, b) => a.rank - b.rank)
      .slice(0, MAX_SUGGESTIONS)
      .map((x) => x.s);
  }, [value, options]);

  const expanded = open && matches.length > 0;

  function choose(s: Suggestion) {
    onChange(s.label);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!expanded) {
        setOpen(true);
        setActive(0);
      } else setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp" && expanded) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === "Escape" && expanded) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="search-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {icon}
        <input
          id={id}
          name={name}
          className="input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={80}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
      </div>
      <ul id={listId} role="listbox" aria-label={`Sugerencias para ${label.toLowerCase()}`} className="suggestions" hidden={!expanded}>
        {matches.map((s, i) => (
          <li
            key={`${s.label}-${s.hint}`}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(s)}
          >
            <span>{s.label}</span>
            <span className="suggestion-hint">{s.hint}</span>
          </li>
        ))}
      </ul>
      <span className="sr-only" aria-live="polite">
        {expanded ? `${matches.length} ${matches.length === 1 ? "sugerencia disponible" : "sugerencias disponibles"}. Usa las flechas para elegir.` : ""}
      </span>
    </div>
  );
}
