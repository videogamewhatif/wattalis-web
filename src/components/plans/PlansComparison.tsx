import { CheckIcon } from "@/components/icons";
import { comparisonCell } from "@/lib/plans/pricing";
import type { PlansCatalog } from "@/lib/plans/types";

/**
 * Comparativa completa por plan. En teléfonos se desplaza dentro de su propio
 * contenedor (enfocable con teclado) con la primera columna fija; la página no
 * se desplaza de lado.
 */
export function PlansComparison({ catalog }: { catalog: PlansCatalog }) {
  const featured = catalog.plans.find((p) => p.badge)?.code;
  return (
    <div className="plans-table-wrap" role="region" aria-labelledby="comparativa-caption" tabIndex={0}>
      <table className="plans-table">
        <caption id="comparativa-caption" className="sr-only">
          Comparación de funciones por plan
        </caption>
        <thead>
          <tr>
            <th scope="col">Función</th>
            {catalog.plans.map((p) => (
              <th key={p.code} scope="col" className={p.code === featured ? "is-featured" : undefined}>
                {p.name}
                {p.badge ? <span className="plans-table-badge">{p.badge}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        {catalog.groups.map((group) => {
          const rows = catalog.features.filter((f) => f.group === group.key);
          if (!rows.length) return null;
          return (
            <tbody key={group.key}>
              <tr className="plans-table-group">
                <th scope="colgroup" colSpan={catalog.plans.length + 1}>
                  {group.label}
                </th>
              </tr>
              {rows.map((f) => (
                <tr key={f.code}>
                  <th scope="row">
                    <span className="plans-table-label">{f.label}</span>
                    {f.soon ? <span className="tag">Próximamente</span> : null}
                    {f.hint ? <span className="plans-table-hint">{f.hint}</span> : null}
                  </th>
                  {catalog.plans.map((p) => {
                    const cell = comparisonCell(catalog, p.code, f.code);
                    return (
                      <td key={p.code} className={p.code === featured ? "is-featured" : undefined}>
                        {cell.text ? (
                          <strong>{cell.text}</strong>
                        ) : cell.included ? (
                          <>
                            <CheckIcon className="plans-yes" />
                            <span className="sr-only">Incluido</span>
                          </>
                        ) : (
                          <>
                            <span className="plans-no" aria-hidden="true">
                              —
                            </span>
                            <span className="sr-only">No incluido</span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
