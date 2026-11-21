# Wattalis · sitio público

Sitio web público de Wattalis. Tiene dos recorridos:

1. **Pacientes**: buscar especialistas de la salud por nombre, especialidad o
   ubicación, filtrar, consultar perfiles con servicios, sedes, horario de
   atención y datos de contacto del consultorio.
2. **Clínicas y profesionales**: conocer el software de gestión de Wattalis y
   entrar a la aplicación privada desde un enlace configurable.

Es una aplicación independiente de la aplicación privada: no comparte
autenticación, permisos, tablas ni flujos con ella. El alcance actual es un
directorio informativo con contacto directo; no hay reserva en línea,
disponibilidad, cuentas de pacientes, pagos, reseñas ni teleconsulta.

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript estricto
- CSS propio con variables (`src/app/globals.css`), sin librerías de UI
- Sin base de datos: arranca con datos ficticios de demostración
- Gestor de dependencias: **npm** (`package-lock.json`)

## Arranque rápido

Requisitos: Node.js 20.9 o superior (probado con Node 22).

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. No hace falta configurar nada: sin variables de
entorno el sitio funciona en modo demo con 14 perfiles ficticios (13
publicados y 1 en borrador).

## Comandos

| Comando             | Qué hace                                               |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo                                 |
| `npm run lint`      | ESLint (reglas de Next.js y TypeScript)                |
| `npm run typecheck` | Genera tipos de rutas y ejecuta `tsc --noEmit`         |
| `npm run test`      | Pruebas con Vitest (búsqueda, publicación, contacto)   |
| `npm run check`     | lint + typecheck + test                                |
| `npm run build`     | Compilación de producción                              |
| `npm run start`     | Sirve la compilación de producción                     |

## Rutas

| Ruta                     | Función                                                   |
| ------------------------ | --------------------------------------------------------- |
| `/`                      | Inicio institucional y buscador                           |
| `/especialistas`         | Directorio con búsqueda, filtros, orden y paginación      |
| `/especialistas/[slug]`  | Perfil público (404 si no existe o no está publicado)     |
| `/especialidades`        | Áreas y especialidades con perfiles publicados            |
| `/especialidades/[slug]` | Especialidad con acceso a sus resultados                  |
| `/para-clinicas`         | Página comercial del software de gestión                  |
| `/nosotros`              | Presentación de Wattalis                                  |
| `/contacto`              | Canales institucionales configurados                      |
| `/privacidad`            | Aviso de privacidad (texto aprobado o «pendiente»)        |
| `/terminos`              | Términos y condiciones (texto aprobado o «pendiente»)     |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/icon.svg` | SEO y recursos |

## Estructura

```
content/legal/              Textos legales aprobados (Markdown)
public/ilustraciones/       Ilustración de portada y retratos ilustrativos (SVG propios)
src/app/                    Rutas (App Router), metadatos, robots y sitemap
src/components/             Componentes de interfaz
src/lib/directory/          Directorio público
  types.ts                  Modelo: PublicProfessional, PublicLocation, PublicService, PublicOfficeHours
  catalog.ts                Áreas, especialidades y alias de ubicación
  normalize.ts              Normalización de texto (acentos, mayúsculas, género y número)
  search.ts                 Búsqueda, filtros, facetas, orden y estado en la URL
  provider.ts               Contrato que debe cumplir cualquier fuente de datos
  providers/demo*.ts        Proveedor local y datos ficticios
  index.ts                  Interfaz única de lectura que consumen páginas y componentes
src/lib/site.ts             Configuración institucional (variables de entorno)
src/lib/seo.ts              Política de indexación y metadatos
src/lib/format.ts           Formatos es-MX: MXN, duración, horario, dirección
```

Páginas y componentes **solo** importan desde `@/lib/directory`; nunca desde un
proveedor concreto.

## Configuración

Copia `.env.example` como `.env.local`. Todas las variables son opcionales.
La mayoría de las páginas se generan al compilar, así que después de cambiar
una variable vuelve a ejecutar `npm run build`.

| Variable                        | Uso                                                                 |
| ------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | URL pública del sitio (canónicas, Open Graph, sitemap). Por defecto `http://localhost:3000` |
| `NEXT_PUBLIC_WATTALIS_APP_URL`  | URL de la aplicación privada. Sin ella se omite «Acceso al sistema» en el encabezado, el menú móvil, el pie, `/para-clinicas` y `/contacto` |
| `WATTALIS_ALLOW_INDEXING`       | `true` para permitir indexación. Vacío = `robots.txt` bloquea todo y cada página lleva `noindex` |
| `WATTALIS_DATA_SOURCE`          | Fuente del directorio. Hoy solo `demo`                              |
| `WATTALIS_SALES_EMAIL` / `_PHONE` | Canal comercial. El botón «Contactar a Wattalis» abre el correo; sin correo lleva a `/contacto` |
| `WATTALIS_CONTACT_EMAIL` / `_PHONE` | Contacto institucional general en `/contacto`                  |
| `WATTALIS_SOCIAL_FACEBOOK` / `_INSTAGRAM` / `_LINKEDIN` | Redes en el pie y en `/contacto`. Se muestran solo si existen |

Si no hay ningún canal configurado, `/contacto` muestra «Configuración
pendiente» en lugar de inventar datos.

## Modo demo y contenido de ejemplo

Los perfiles de demostración están en
`src/lib/directory/providers/demo-data.ts`. Todos son ficticios:

- calles con nombres de ejemplo («Calle Ejemplo», «Av. Demostración»),
  teléfonos con el bloque `0000` y correos con el dominio reservado `.example`;
- `isDemo: true`, que hace que el perfil muestre «Perfil ficticio», presente
  teléfono y correo como texto (sin enlaces `tel:`, `mailto:` ni mapa) y quede
  fuera de indexación y del sitemap.

Casos cubiertos: 5 áreas, 3 ciudades (Ciudad de México, Guadalajara,
Monterrey), un perfil con dos sedes y precios distintos por sede
(`ana-lucia-rios-peralta`), servicios sin precio, perfiles sin fotografía,
un perfil con datos opcionales incompletos (`mariana-leal-guajardo`) y uno
sin publicar (`hector-medina-rosales`, devuelve 404).

Para cambiar el contenido demo, edita ese archivo respetando los tipos de
`types.ts`. Las áreas y especialidades viven en `catalog.ts`; solo se
muestran las que tienen al menos un perfil publicado.

## Búsqueda

- Busca por nombre, especialidad, área, título declarado y servicios; la
  ubicación por colonia, municipio o alcaldía, ciudad, estado, código postal
  y alias (`cdmx`, `gdl`, `mty`…).
- Ignora mayúsculas, acentos y espacios, y tolera género y número:
  «psicologa» encuentra «Psicóloga» y «Psicología».
- Texto, ubicación y filtros se aplican en conjunto. Cada palabra de la
  ubicación debe coincidir con una misma sede.
- Todo el estado vive en la URL y se puede compartir:
  `/especialistas?q=psicologia&ubicacion=cdmx&area=psicologia&especialidad=terapia-de-pareja&ciudad=ciudad-de-mexico&orden=alfabetico&pagina=2`.
  Cambiar cualquier criterio reinicia la página. Valores desconocidos se ignoran.
- Orden: «Mayor coincidencia» cuando hay texto y «Alfabético (A–Z)»; los
  empates se resuelven por apellido y luego por identificador.
- El formulario funciona sin JavaScript (GET); con JavaScript añade
  sugerencias navegables con teclado.
- Desde un perfil, «Volver a los resultados» restaura la búsqueda de origen
  (parámetro `volver`, saneado en el servidor). Si se entra directo, lleva al
  directorio general.

## Sustituir la fuente de datos

La fuente se elige en `createProvider()` dentro de
`src/lib/directory/index.ts`. Para conectar el directorio real:

1. Crea `src/lib/directory/providers/<nombre>.ts` que devuelva un
   `DirectoryProvider` (`src/lib/directory/provider.ts`):

   ```ts
   import type { DirectoryProvider } from "../provider";

   export function createPublicSourceProvider(): DirectoryProvider {
     return {
       name: "public-source",
       async listPublishedProfessionals() {
         // Leer de la fuente pública autorizada y mapear a PublicProfessional.
         // Devolver solo perfiles con status "published" e isDemo: false.
       },
       async getPublishedProfessionalBySlug(slug) {
         // Misma regla: null si no existe o no está publicado.
       },
       // Opcional: search(query) si la fuente puede buscar por sí misma.
     };
   }
   ```

2. Regístralo en `createProvider()` con un nuevo valor de
   `WATTALIS_DATA_SOURCE` y configura la variable en el despliegue.
3. Lee credenciales, si las hay, solo de variables **sin** prefijo
   `NEXT_PUBLIC_`. El proveedor corre en el servidor; nunca uses claves
   privilegiadas en el navegador.
4. Ejecuta `npm run check` y `npm run build`.

Reglas del contrato:

- Usa una fuente pública autorizada o una API de lectura que exponga solo los
  campos permitidos de perfiles publicados. Este repositorio no define ni
  supone endpoints del sistema privado: hay que acordarlos con el equipo de
  la aplicación.
- El estado de publicación se filtra en la fuente y otra vez en
  `index.ts` (incluido el acceso directo por slug).
- Fuera del directorio quedan pacientes, citas, cobros, horarios operativos
  de agenda, credenciales, notas internas y datos de otras organizaciones.
  El horario público (`PublicOfficeHours`) es el horario de atención del
  consultorio, no disponibilidad.
- Si los datos cambian con frecuencia, añade revalidación a las páginas
  estáticas (por ejemplo `export const revalidate = 3600` en
  `especialidades`) o vuelve a compilar al publicar cambios.

### Campos que la clínica debe aprobar para publicar un perfil

| Entidad | Campos publicables |
| ------- | ------------------ |
| Profesional | slug, nombre público, título profesional declarado, área, especialidades, resumen, biografía, trayectoria, formación, idiomas, cédula profesional (voluntaria), fotografía y su texto alternativo |
| Sede | nombre, calle y número, colonia, municipio o alcaldía, ciudad, estado, código postal, referencia de ubicación, teléfono público, correo público autorizado |
| Servicio | nombre, descripción breve, duración, precio en MXN, sedes donde aplica |
| Horario | días y horas de atención por sede |

Cada campo opcional que no se apruebe simplemente no se muestra. Publicar una
cédula no activa ningún distintivo. El sitio no muestra «Verificado»,
calificaciones, testimonios ni reconocimientos.

### Retirar un perfil

Cambia su estado en la fuente a algo distinto de `published` (en demo:
`status: "draft"` o `"withdrawn"`). Desde ese momento no aparece en búsquedas,
especialidades, portada ni sitemap, y su URL devuelve 404. En páginas
generadas al compilar, el cambio se refleja tras la siguiente compilación o
revalidación.

## Indexación y SEO

- Sin `WATTALIS_ALLOW_INDEXING=true`: `robots.txt` bloquea todo y todas las
  páginas llevan `noindex`.
- Con indexación activa:
  - se indexan portada, directorio general, especialidades con perfiles
    reales, páginas institucionales y perfiles reales publicados;
  - los perfiles demo, las especialidades con solo perfiles demo y los textos
    legales pendientes llevan `noindex` y no entran al sitemap;
  - las búsquedas con parámetros (`/especialistas?…`) llevan `noindex` y su
    canónica es `/especialistas`; el sitemap no incluye combinaciones de filtros.
- Los perfiles reales incluyen datos estructurados `Person` solo con contenido
  visible (sin reseñas, valoraciones ni disponibilidad).
- Metadatos únicos por página, Open Graph, canónicas, favicon (`src/app/icon.svg`)
  e imagen Open Graph generada (`src/app/opengraph-image.tsx`).

## Textos legales

Coloca los textos aprobados en `content/legal/privacidad.md` y
`content/legal/terminos.md` (formato en `content/legal/README.md`). Mientras
falten, las páginas muestran «Documento pendiente», no se indexan y no entran
al sitemap. **La publicación comercial requiere incorporar ambos textos.**

## Marca e imágenes

- Logotipo tipográfico provisional (`src/components/Logo.tsx`): «Wattalis» con
  punto ámbar. Sustitúyelo cuando exista el logotipo oficial.
- La ilustración de portada (`public/ilustraciones/consultorio.svg`) y los
  retratos de `public/ilustraciones/perfiles/` son SVG creados para este
  proyecto. Los retratos se identifican como ilustrativos en la interfaz.
  Para usar una fotografía real en la portada, colócala en `public/`, conserva
  `width`/`height` en `src/app/page.tsx` y verifica que su licencia lo permita.
- Colores: variables CSS en `:root` de `src/app/globals.css`. Tipografía:
  DM Sans vía `next/font` (se descarga al compilar y se sirve desde el propio sitio).

## Despliegue

1. Define en el proveedor de hosting: `NEXT_PUBLIC_SITE_URL`,
   `NEXT_PUBLIC_WATTALIS_APP_URL`, canales de contacto y, solo en producción,
   `WATTALIS_ALLOW_INDEXING=true`.
2. `npm ci && npm run check && npm run build && npm run start`
   (o el flujo nativo de Next.js de tu plataforma, por ejemplo Vercel).
3. Comprueba `/robots.txt`, `/sitemap.xml` y que los perfiles demo no aparezcan
   si ya conectaste la fuente real.

### Pendiente antes de publicar

- [ ] Textos aprobados de aviso de privacidad y términos.
- [ ] URL de la aplicación privada (`NEXT_PUBLIC_WATTALIS_APP_URL`).
- [ ] Canal comercial y contacto institucional.
- [ ] Fuente pública autorizada del directorio y su proveedor.
- [ ] Logotipo oficial y, si se desea, fotografía de portada con licencia.
- [ ] Validar con Wattalis los textos de `/para-clinicas` y `/nosotros`
      (funciones y descripciones de roles).
- [ ] Dominio definitivo y `WATTALIS_ALLOW_INDEXING=true` solo en producción.
