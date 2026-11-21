import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PublicLocation, PublicOfficeHours } from "@/lib/directory";
import { LocationBlock } from "./LocationBlock";

const location: PublicLocation = {
  id: "sede-1",
  name: "Consultorio de prueba",
  street: "Calle Ejemplo 1",
  neighborhood: "Centro",
  municipality: "Monterrey",
  city: "Monterrey",
  state: "Nuevo León",
  postalCode: "64000",
  phone: "81 0000 0000",
  email: "sede@ejemplo.example",
};
const hours: PublicOfficeHours[] = [1, 2, 3, 4, 5].map((day) => ({
  locationId: "sede-1",
  day: day as PublicOfficeHours["day"],
  opens: "09:00",
  closes: "14:00",
}));

describe("LocationBlock", () => {
  it("en perfiles reales ofrece llamar, escribir y cómo llegar", () => {
    const html = renderToStaticMarkup(<LocationBlock location={location} hours={hours} demo={false} />);
    expect(html).toContain('href="tel:+528100000000"');
    expect(html).toContain('href="mailto:sede@ejemplo.example"');
    expect(html).toContain("https://www.google.com/maps/search/");
    expect(html).toContain("Llamar al consultorio");
    expect(html).toContain("Escribir al consultorio");
    expect(html).toContain("Cómo llegar");
    expect(html).toContain("Horario de atención");
    expect(html).toContain("Lunes a viernes");
  });

  it("en perfiles ficticios no genera enlaces de contacto ni de mapa", () => {
    const html = renderToStaticMarkup(<LocationBlock location={location} hours={hours} demo />);
    expect(html).not.toMatch(/href="(tel:|mailto:|https?:)/);
    expect(html).toContain("Teléfono ficticio");
  });

  it("omite acciones sin datos publicados", () => {
    const bare: PublicLocation = { ...location, street: undefined, phone: undefined, email: undefined };
    const html = renderToStaticMarkup(<LocationBlock location={bare} hours={[]} demo={false} />);
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("Horario de atención");
    expect(html).toContain("no publicó teléfono ni correo");
  });
});
