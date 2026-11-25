"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { formatCents, type PlanQuote } from "@/lib/plans/pricing";
import type { BillingInterval } from "@/lib/plans/types";

export interface PlanOffer {
  code: string;
  name: string;
  description: string;
  badge: string | null;
  customPricing: boolean;
  quotes: Record<BillingInterval, PlanQuote | null>;
  highlights: { intro: string | null; items: string[] };
  /** Destino de «Elegir plan» por periodicidad (contratación en la aplicación). */
  hrefs: Record<BillingInterval, string>;
  external: boolean;
  ctaLabel: string;
}

/** Selector mensual/anual y tarjetas de planes. */
export function PlansExplorer({ offers, discountLabel }: { offers: PlanOffer[]; discountLabel: string }) {
  const [interval, setPeriod] = useState<BillingInterval>("month");
  const name = useId();
  return (
    <div className="plans-explorer">
      <fieldset className="plans-toggle">
        <legend className="sr-only">Periodicidad de facturación</legend>
        <div className="plans-toggle-track">
          {(["month", "year"] as const).map((value) => (
            <label key={value} className={interval === value ? "is-active" : undefined}>
              <input type="radio" name={name} value={value} checked={interval === value} onChange={() => setPeriod(value)} className="sr-only" />
              {value === "month" ? "Mensual" : "Anual"}
              {value === "year" ? <span className="plans-toggle-chip">−{discountLabel}</span> : null}
            </label>
          ))}
        </div>
        <p className="plans-toggle-note" aria-live="polite">
          {interval === "year" ? `Un solo cargo al año con ${discountLabel} de descuento frente a 12 pagos mensuales.` : "Cargo cada mes. Puedes cambiar a anual cuando quieras."}
        </p>
      </fieldset>

      <ul className="plans-grid">
        {offers.map((offer) => {
          const q = offer.quotes[interval];
          const featured = Boolean(offer.badge);
          const href = offer.hrefs[interval];
          const cta = (
            <>
              {offer.ctaLabel}
              <ArrowRightIcon />
            </>
          );
          const ctaClass = `btn ${featured ? "btn-primary" : "btn-secondary"} btn-block`;
          return (
            <li key={offer.code}>
              <article className={`plan-card${featured ? " is-featured" : ""}`} aria-labelledby={`plan-${offer.code}`}>
                {offer.badge ? <p className="plan-badge">{offer.badge}</p> : null}
                <h3 id={`plan-${offer.code}`}>{offer.name}</h3>
                <p className="plan-desc">{offer.description}</p>
                <div className="plan-price" aria-live="polite">
                  {q ? (
                    <>
                      <p className="plan-amount">
                        <strong>{formatCents(q.monthlyEquivalentCents, { compact: true })}</strong> <span>MXN/mes</span>
                      </p>
                      {interval === "year" ? (
                        <p className="plan-period">
                          <b>{formatCents(q.periodPriceCents)} MXN</b> cobrados una vez al año
                          {q.annualSavingsCents > 0 ? <span className="plan-savings">Ahorras {formatCents(q.annualSavingsCents)} al año</span> : null}
                        </p>
                      ) : (
                        <p className="plan-period">Cobro mensual · {formatCents(q.listAnnualCents, { compact: true })} al año</p>
                      )}
                      <p className="plan-tax">{q.taxIncluded ? "IVA incluido" : `Más IVA (${q.taxRateBps / 100} %)`}</p>
                    </>
                  ) : (
                    <>
                      <p className="plan-amount plan-amount--custom">Precio personalizado</p>
                      <p className="plan-period">Según sedes, usuarios e integraciones.</p>
                    </>
                  )}
                </div>
                {offer.external ? (
                  <a className={ctaClass} href={href} aria-label={`${offer.ctaLabel}: plan ${offer.name}`}>
                    {cta}
                  </a>
                ) : (
                  <Link className={ctaClass} href={href} aria-label={`${offer.ctaLabel}: plan ${offer.name}`}>
                    {cta}
                  </Link>
                )}
                <div className="plan-features">
                  {offer.highlights.intro ? <p className="plan-features-intro">{offer.highlights.intro}</p> : null}
                  <ul>
                    {offer.highlights.items.map((item) => (
                      <li key={item}>
                        <CheckIcon />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
