import Link from "next/link";
import { ArrowRightIcon, CalendarIcon, CheckIcon, ClockIcon, FolderIcon, InfoIcon, MailIcon, ShieldIcon, UsersIcon, WalletIcon } from "@/components/icons";
import { PlansComparison } from "@/components/plans/PlansComparison";
import { type PlanOffer, PlansExplorer } from "@/components/plans/PlansExplorer";
import { appPricingHref, checkoutHref, getPlansCatalog } from "@/lib/plans";
import { annualDiscountLabel, percent, planHighlights, quotePlan } from "@/lib/plans/pricing";
import { pageMetadata } from "@/lib/seo";
import { salesContactHref, site } from "@/lib/site";
import "./planes.css";

export const metadata = pageMetadata({
  title: "Planes y precios",
  description: "Planes de Wattalis para consultorios, clínicas, centros médicos y hospitales: facturación mensual o anual, comparativa de funciones y contratación en línea.",
  path: "/planes",
});

// Los precios vigentes los publica la aplicación; se vuelven a consultar cada minuto.
export const revalidate = 60;

const STEPS = [
  { title: "Elige tu plan", text: "Compara los planes y decide entre pago mensual o anual." },
  { title: "Crea tu cuenta", text: "Regístrate o inicia sesión; cada persona usa su propia cuenta." },
  { title: "Registra tu organización", text: "La suscripción queda a nombre de tu clínica o consultorio, no de una persona." },
  { title: "Revisa el resumen", text: "Ves el desglose con descuento, IVA, total y la fecha de renovación antes de confirmar." },
  { title: "Paga de forma segura", text: "El pago se hace en la página de la pasarela; Wattalis nunca recibe los datos de tu tarjeta." },
  { title: "Empieza a trabajar", text: "Tu espacio queda listo con las funciones de tu plan habilitadas." },
];

const MANAGE = [
  { icon: CalendarIcon, title: "Mi plan", text: "Estado, precio, fecha de renovación y cuántos profesionales y usuarios usas de tu límite." },
  { icon: FolderIcon, title: "Facturación", text: "Historial de cobros con fechas, importes, estado del pago y comprobantes descargables." },
  { icon: WalletIcon, title: "Métodos de pago", text: "Agrega, actualiza o elimina tu tarjeta desde el portal seguro de la pasarela." },
  { icon: ClockIcon, title: "Renovación", text: "Activa o desactiva la renovación automática y consulta el próximo cobro." },
  { icon: MailIcon, title: "Avisos", text: "Te avisamos antes de renovar, si un pago no se procesa y cuando cambias de plan." },
  { icon: UsersIcon, title: "Cambia o cancela", text: "Mejora al momento pagando solo la diferencia, o programa una reducción o cancelación." },
];

export default async function PlansPage() {
  const { catalog, source } = await getPlansCatalog();
  const sales = salesContactHref();
  const salesExternal = sales.startsWith("mailto:");
  const discount = annualDiscountLabel(catalog);
  const { settings } = catalog;

  const offers: PlanOffer[] = catalog.plans.map((plan, i) => {
    const month = checkoutHref(plan.code, "month");
    const year = checkoutHref(plan.code, "year");
    const canBuy = !plan.is_custom_pricing && month && year;
    return {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      badge: plan.badge,
      customPricing: plan.is_custom_pricing,
      quotes: { month: quotePlan(plan, "month", settings), year: quotePlan(plan, "year", settings) },
      highlights: planHighlights(catalog, plan, i > 0 ? catalog.plans[i - 1] : null),
      hrefs: canBuy ? { month, year } : plan.is_custom_pricing ? { month: "#corporativo", year: "#corporativo" } : { month: sales, year: sales },
      external: Boolean(canBuy) || (!plan.is_custom_pricing && salesExternal),
      ctaLabel: plan.is_custom_pricing ? "Hablar con ventas" : canBuy ? `Elegir ${plan.name}` : "Solicitar información",
    };
  });

  const faq = [
    { q: "¿Puedo cambiar de plan después?", a: "Sí. Una mejora se aplica de inmediato y solo pagas la diferencia proporcional del periodo. Una reducción se programa para el final del periodo que ya pagaste." },
    { q: "¿Qué pasa con mi información si cancelo?", a: "Conservas el acceso hasta el final del periodo pagado. Después tu espacio queda en modo de consulta: no se borran pacientes, citas, cobros ni usuarios, y puedes reactivar tu plan cuando quieras." },
    { q: "¿Cómo funciona la facturación anual?", a: `Pagas los 12 meses en un solo cargo al año con ${discount} de descuento sobre el precio mensual. El precio equivalente por mes es solo una referencia: el cargo real es anual.` },
    { q: "¿Qué pasa si un pago no se procesa?", a: `Te avisamos y reintentamos el cobro. Mantienes el acceso completo durante un periodo de gracia de ${settings.grace_period_days} días para actualizar tu método de pago; si no se regulariza, el espacio pasa a modo de consulta sin perder información.` },
    { q: "¿Los precios incluyen impuestos?", a: settings.prices_include_tax ? `Sí, incluyen IVA (${percent(settings.tax_rate_bps)}). El desglose aparece en el resumen antes de confirmar.` : `No, al precio se suma el IVA (${percent(settings.tax_rate_bps)}). El desglose aparece en el resumen antes de confirmar.` },
    { q: "¿Emiten factura (CFDI)?", a: "La facturación electrónica se habilitará con un proveedor autorizado. Mientras tanto, los comprobantes de la demostración no tienen validez fiscal." },
    { q: "¿Quién puede contratar o cambiar el plan?", a: "La Administración del espacio de trabajo. Recepción y profesionales ven el plan de su espacio, pero no los cobros." },
  ];
  const fullPricing = appPricingHref();
  const firstCheckout = checkoutHref("profesional", "month");

  return (
    <>
      <section className="plans-hero">
        <div className="container plans-hero-inner">
          <p className="eyebrow">Planes y precios</p>
          <h1>Un plan para cada etapa de tu crecimiento</h1>
          <p className="lead">Desde tu primer consultorio hasta una red de clínicas. Wattalis crece contigo.</p>
          <p className="plans-pill">
            <InfoIcon />
            {catalog.demo ? "Precios ilustrativos · modo demostración, sin cobros reales" : "Precios ilustrativos; pueden cambiar"}
          </p>
        </div>
      </section>

      <section className="section plans-section-tight" aria-labelledby="planes-titulo">
        <div className="container">
          <h2 id="planes-titulo" className="sr-only">
            Planes
          </h2>
          <PlansExplorer offers={offers} discountLabel={discount} />
          <p className="plans-note">
            {settings.prices_include_tax ? "Precios en pesos mexicanos con IVA incluido." : `Precios en pesos mexicanos más IVA (${percent(settings.tax_rate_bps)}).`} La facturación anual se cobra en un solo cargo; el
            precio mensual equivalente es solo una referencia. El descuento anual ({discount}) es ilustrativo y puede cambiar.
            {source === "fallback" ? " Se muestran los valores iniciales porque la aplicación no respondió." : ""}
          </p>
          {!site.appUrl ? (
            <p className="notice notice-info plans-config-note">La contratación en línea se habilitará cuando se configure la dirección de la aplicación. Mientras tanto, escríbenos para contratar.</p>
          ) : null}
        </div>
      </section>

      <section className="section plans-steps-section" aria-labelledby="como-titulo">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Contratación en línea</p>
            <h2 id="como-titulo">Contrata en minutos, en seis pasos</h2>
            <p className="lead">Un proceso claro, con el resumen completo antes de pagar.</p>
          </div>
          <ol className="plans-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="plans-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="comparativa-titulo">
        <div className="container">
          <div className="section-head">
            <h2 id="comparativa-titulo">Compara todas las funciones</h2>
            <p className="muted">En el teléfono, desliza la tabla hacia los lados para ver todos los planes.</p>
          </div>
          <PlansComparison catalog={catalog} />
        </div>
      </section>

      <section className="section plans-manage-section" aria-labelledby="gestion-titulo">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Suscripción y facturación</p>
            <h2 id="gestion-titulo">Todo bajo control desde tu espacio de trabajo</h2>
            <p className="lead">La Administración de tu clínica gestiona la suscripción sin llamar a nadie.</p>
          </div>
          <ul className="plans-manage">
            {MANAGE.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="plans-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="garantias-titulo">
        <div className="container">
          <div className="section-head">
            <h2 id="garantias-titulo">Pensado para la operación de salud</h2>
          </div>
          <ul className="plans-guarantees">
            <li>
              <ShieldIcon />
              <div>
                <h3>Tu información siempre es tuya</h3>
                <p>Si cancelas o un pago se retrasa, nada se borra: pacientes, citas y cobros quedan disponibles para consulta y exportación.</p>
              </div>
            </li>
            <li>
              <UsersIcon />
              <div>
                <h3>Cada clínica, por separado</h3>
                <p>La suscripción pertenece a tu organización. Ninguna otra clínica puede ver tu información ni tu facturación.</p>
              </div>
            </li>
            <li>
              <CheckIcon />
              <div>
                <h3>Cancelación sin trucos</h3>
                <p>Cancelas en dos clics, conservas el acceso hasta el final del periodo y puedes deshacerlo o reactivar cuando quieras.</p>
              </div>
            </li>
            <li>
              <MailIcon />
              <div>
                <h3>Sin cobros sorpresa</h3>
                <p>Te avisamos antes de cada renovación y si un pago no se procesa, con {settings.grace_period_days} días de gracia para regularizar.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section id="corporativo" className="section plans-section-tight" aria-labelledby="corporativo-titulo">
        <div className="container">
          <div className="clinics-band">
            <div className="clinics-band-grid">
              <div className="stack">
                <p className="eyebrow">Planes empresariales</p>
                <h2 id="corporativo-titulo">¿Un hospital o un grupo médico?</h2>
                <p>
                  El plan Corporativo reúne varias sedes bajo una sola cuenta, con límites a la medida, administración empresarial, facturación centralizada y condiciones comerciales
                  particulares.
                </p>
              </div>
              <div className="cta-row">
                {salesExternal ? (
                  <a className="btn btn-on-dark" href={sales}>
                    Hablar con ventas
                  </a>
                ) : (
                  <Link className="btn btn-on-dark" href={sales}>
                    Hablar con ventas
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-titulo">
        <div className="container plans-faq-wrap">
          <h2 id="faq-titulo">Preguntas frecuentes</h2>
          <div className="plans-faq">
            {faq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section plans-final" aria-labelledby="final-titulo">
        <div className="container plans-final-inner">
          <h2 id="final-titulo">¿Listo para empezar?</h2>
          <div className="cta-row">
            {firstCheckout ? (
              <a className="btn btn-primary" href={firstCheckout}>
                Elegir mi plan
                <ArrowRightIcon />
              </a>
            ) : salesExternal ? (
              <a className="btn btn-primary" href={sales}>
                Contactar a Wattalis
              </a>
            ) : (
              <Link className="btn btn-primary" href={sales}>
                Contactar a Wattalis
              </Link>
            )}
            {fullPricing ? (
              <a className="btn btn-secondary" href={fullPricing}>
                Ver precios en la aplicación
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
