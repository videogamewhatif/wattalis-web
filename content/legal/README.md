# Textos legales

Coloca aquí los textos aprobados por Wattalis:

- `privacidad.md` → se publica en `/privacidad`
- `terminos.md` → se publica en `/terminos`

Mientras un archivo no exista, su página muestra «Documento pendiente» y queda
fuera de indexación y del sitemap.

Formato admitido (Markdown básico): encabezados `#`, `##`, `###`, párrafos,
listas con `-` o `1.`, **negritas** y enlaces `[texto](https://…)`. No se
interpreta HTML.

Opcionalmente, agrega la fecha de vigencia al inicio:

```markdown
---
actualizado: 15 de enero de 2027
---

# Aviso de privacidad integral
…
```

Después de agregar o cambiar un texto, vuelve a compilar (`npm run build`).
