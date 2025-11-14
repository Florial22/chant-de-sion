/** Base normalizer: lowercase, strip diacritics, keep a-z/0-9/space/apos */
export function normalize(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")        // strip diacritics
    .replace(/[’´`"]/g, "'")                // unify quotes
    .replace(/[^a-z0-9\s']/g, " ")          // keep letters/numbers/space/apos
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Kreyòl-aware contraction normalizer.
 * Canonicalizes variants to the *joined* form.
 */
export function normalizeKreyol(input: string): string {
  let s = (input ?? "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’´`]/g, "'")
    .replace(/[–—]/g, "-");

  // 1) Specific common forms (use word boundaries and optional hyphen/apos/space)
  // sa w → saw
  s = s.replace(/\bsa\s*['’-]?\s*w\b/g, "saw");

  // pou n → poun
  s = s.replace(/\bpou\s*['’-]?\s*([mwnl])\b/g, "pou$1");

  // ki/ke/ak/a + clitic letter → merged
  s = s.replace(/\b(ki|ke|ak|a)\s*['’-]?\s*([mwnl])\b/g, (_m, p, cl) => p + cl);

  // Verb clitic combos
  s = s.replace(/\bm\s*['’-]?\s*pa\b/g, "mpa");
  s = s.replace(/\bm\s*['’-]?\s*ap\b/g, "map");
  s = s.replace(/\bm\s*['’-]?\s*a\b/g, "ma");

  s = s.replace(/\bw\s*['’-]?\s*ap\b/g, "wap");
  s = s.replace(/\bw\s*['’-]?\s*a\b/g, "wa");

  s = s.replace(/\bn\s*['’-]?\s*ap\b/g, "nap");
  s = s.replace(/\bn\s*['’-]?\s*a\b/g, "na");

  s = s.replace(/\by\s*['’-]?\s*ap\b/g, "yap");

  s = s.replace(/\bl\s*['’-]?\s*ap\b/g, "lap");
  s = s.replace(/\bl\s*['’-]?\s*a\b/g, "la");

  // Generic clitic merges
  s = s.replace(/\b([a-z]{2,})\s*['’-]?\s*([mwnlwy])\b/g, "$1$2");
  s = s.replace(/\b([mwnlwy])\s*['’-]?\s+([a-z]{2,})\b/g, "$1$2");

  // Cleanup
  s = s
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return s;
}

/**
 * Theology/name normalizer for ChantDeSion.
 * Handles: bondye / bon dye / bon dieu, jezi / jezu / jesus.
 */
export function normalizeTheology(input: string): string {
  let s = normalizeKreyol(input);

  // ---- BONDYE variants ----
  s = s.replace(/\bbon\s+d(?:ye|ieu)\b/g, "bondye");
  s = s.replace(/\bbond(?:ye|ieu)\b/g, "bondye");
  s = s.replace(/\bbon-?d(?:ye|ieu)\b/g, "bondye");

  // ---- JEZI / JESUS variants ----
  s = s.replace(/\bjesus?\b/g, "jezi"); // jesus, jesu → jezi
  s = s.replace(/\bjesu\b/g, "jezi");
  s = s.replace(/\bjezu\b/g, "jezi");

  // Cleanup
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

  return Array.from(new Set([toks.join(" "), v1, v2]));
}

/**
 * Build all query variants we’ll match against:
 * - base normalized
 * - Kreyòl normalized
 * - theology-normalized
 * - and each with 'ou'↔'w' swaps
 */
export function queryVariants(q: string): string[] {
  const variants = new Set<string>();

  const base = normalize(q);
  const krey = normalizeKreyol(q);
  const theo = normalizeTheology(q);

  if (base) variants.add(base);
  if (krey) variants.add(krey);
  if (theo) variants.add(theo);

  for (const v of expandOuWTokens(q)) {
    const nb = normalize(v);
    const nk = normalizeKreyol(v);
    const nt = normalizeTheology(v);

    if (nb) variants.add(nb);
    if (nk) variants.add(nk);
    if (nt) variants.add(nt);
  }

  return Array.from(variants);
}
