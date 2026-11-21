import Image from "next/image";
import { AREA_COLOR_VAR, type PublicProfessional } from "@/lib/directory";
import { initials } from "@/lib/format";
import type { CSSProperties } from "react";

/** Foto publicada o, si no existe, iniciales sobre fondo de marca. */
export function Avatar({
  professional,
  size = 64,
  priority = false,
}: {
  professional: PublicProfessional;
  size?: number;
  priority?: boolean;
}) {
  const style = {
    "--avatar-size": `${size}px`,
    "--area-color": AREA_COLOR_VAR[professional.areaId],
  } as CSSProperties;
  const photo = professional.photo;
  return (
    <span className="avatar" style={style}>
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.illustrative ? `${photo.alt} (imagen ilustrativa)` : photo.alt}
          width={size}
          height={size}
          priority={priority}
        />
      ) : (
        <span aria-hidden="true">{initials(professional.publicName)}</span>
      )}
    </span>
  );
}
