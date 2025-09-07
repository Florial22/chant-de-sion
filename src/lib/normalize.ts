// src/lib/normalize.ts
/**
 * Normalize text for language-agnostic search:
 * - lowercase
 * - strip diacritics (é → e)
 * - unify quotes
 * - keep only a–z, 0–9, space, apostrophe
 * - collapse whitespace
 */
export function normalize(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // strip combining marks
    .replace(/[`´’'"]/g, "'")            // unify quotes
    .replace(/[^a-z0-9\s']/g, " ")       // remove other symbols
    .replace(/\s+/g, " ")                // collapse spaces
    .trim();
}
