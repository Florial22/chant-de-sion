/** Base normalizer: lowercase, strip diacritics, keep a-z/0-9/space/apos */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[’´`"]/g, "'") 
    .replace(/[^a-z0-9\s']/g, " ")  
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Creole-aware contraction normalizer.
 * Joins variants like:
 *   m pa / m-pa / m’pa  -> mpa
 *   pou n / pou-n       -> poun
 *   sa w / sa'w / sa-w  -> saw
 *   ki w / ak w         -> kiw / akw
 * Works AFTER case-fold + diacritics clean but BEFORE final strip.
 */
export function normalizeKreyol(input: string): string {
  let s = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // unify punctuation we care about
  s = s.replace(/[’´`]/g, "'").replace(/[–—]/g, "-");

  // Specific common patterns first
  s = s.replace(/\bsa\s*['’-]?\s*w\b/g, "saw");           // sa w → saw
  s = s.replace(/\bpou\s*['’-]?\s*([mwnl])\b/g, "pou$1"); // pou n → poun
  s = s.replace(/\b(ki|ke|ak|a)\s*['’-]?\s*([mwnl])\b/g, (_m, p, cl) => p + cl);

  // Word + clitic letter at end: "mo w" / "mo-w" / "mo'w" → "mow"
  s = s.replace(/\b([a-z]{2,})\s*['’-]?\s*([mwnl])\b/g, "$1$2");

  // Clitic letter + word at start: "m pa" / "m-pa" / "m’ pa" → "mpa"
  s = s.replace(/\b([mwnl])\s*['’-]?\s+([a-z]{2,})\b/g, "$1$2");

  // Final strip like base
  s = s
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return s;
}

/** Expand token-level variants in queries: 'ou' ↔ 'w' */
function expandOuWTokens(q: string): string[] {
  const toks = normalize(q).split(/\s+/).filter(Boolean);
  if (!toks.length) return [normalize(q)];

  const v1 = toks.map((t) => (t === "ou" ? "w" : t)).join(" ");
  const v2 = toks.map((t) => (t === "w" ? "ou" : t)).join(" ");

  // dedupe
  return Array.from(new Set([toks.join(" "), v1, v2]));
}

/**
 * Build all query variants we’ll match against:
 * - base normalized
 * - creole-contraction normalized
 * - and each of those with 'ou'↔'w' token swaps
 */
export function queryVariants(q: string): string[] {
  const variants = new Set<string>();

  // raw → base + kreyòl
  variants.add(normalize(q));
  variants.add(normalizeKreyol(q));

  // token swaps 'ou' ↔ 'w' → normalize both ways
  for (const v of expandOuWTokens(q)) {
    variants.add(normalize(v));
    variants.add(normalizeKreyol(v));
  }

  return Array.from(variants).filter(Boolean);
}
