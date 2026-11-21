import { AREA_COLOR_VAR, getArea, type AreaId } from "@/lib/directory";
import type { CSSProperties } from "react";

/** Etiqueta de área: el color acompaña siempre a un texto visible. */
export function AreaTag({ areaId }: { areaId: AreaId }) {
  const area = getArea(areaId);
  if (!area) return null;
  return (
    <span className="area-tag" style={{ "--area-color": AREA_COLOR_VAR[areaId] } as CSSProperties}>
      {area.label}
    </span>
  );
}

export function DemoTag({ children = "Perfil ficticio" }: { children?: string }) {
  return <span className="tag tag-demo">{children}</span>;
}
