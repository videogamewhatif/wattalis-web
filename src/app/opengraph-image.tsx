import { ImageResponse } from "next/og";

export const alt = "Wattalis · Encuentra a tu próximo especialista";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f6f5f1",
          color: "#1b2528",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 56, fontWeight: 800, color: "#15454a" }}>
          Wattalis
          <div style={{ width: 16, height: 16, borderRadius: 8, background: "#f59e0b", marginLeft: 6, marginBottom: 14 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            Encuentra a tu próximo especialista
          </div>
          <div style={{ fontSize: 32, color: "#3d4a4e", maxWidth: 900 }}>
            Directorio de especialistas de la salud y software para consultorios.
          </div>
        </div>
        <div style={{ display: "flex", height: 12, borderRadius: 6, background: "#175359" }} />
      </div>
    ),
    size,
  );
}
