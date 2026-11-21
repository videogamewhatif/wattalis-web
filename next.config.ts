import type { NextConfig } from "next";

// Se usa el modelo de renderizado clásico (sin Cache Components): las páginas
// que leen searchParams se renderizan en el servidor en cada solicitud y el
// resto se genera de forma estática.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
