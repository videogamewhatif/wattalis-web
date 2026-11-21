const STOPWORDS = new Set([
  "a", "al", "con", "de", "del", "el", "en", "la", "las", "lo", "los",
  "para", "por", "un", "una", "y", "e", "o",
]);

/** Minúsculas, sin acentos ni diéresis y con espacios simples. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Divide un texto normalizado en palabras significativas. */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9ñ]+/)
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

/**
 * Raíz sencilla para tolerar género y número en español:
 * «psicologa», «psicologo» y «psicologos» comparten «psicolog»,
 * que también es prefijo de «psicologia».
 */
export function stem(token: string): string {
  if (/^\d+$/.test(token)) return token;
  const stripped = token.replace(/(as|os|es|a|o|e|s)$/, "");
  return stripped.length >= 4 ? stripped : token;
}

/**
 * Compara una palabra buscada con las palabras de un campo.
 * Devuelve 1 si coincide exactamente, 0.7 si coincide por raíz o prefijo
 * y 0 si no coincide.
 */
export function matchToken(queryToken: string, fieldTokens: readonly string[]): number {
  const root = stem(queryToken);
  let best = 0;
  for (const token of fieldTokens) {
    if (token === queryToken) return 1;
    if (root.length >= 3 && token.startsWith(root)) best = 0.7;
    else if (queryToken.length >= 3 && token.startsWith(queryToken)) best = 0.7;
  }
  return best;
}

/** Convierte un texto en un slug legible para URL. */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
