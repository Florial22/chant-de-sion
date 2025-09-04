// src/lib/pickTitle.ts
import type { Song, LangCode } from "../types/song";

/** Choose the best title for the current language context. */
export function pickTitle(
  song: Song,
  opts?: { prefer?: LangCode | "auto"; fallbacks?: LangCode[] }
): string {
  const t = song.titles || ({} as any);
  const tryLangs: LangCode[] = [];

  if (opts?.prefer && opts.prefer !== "auto") tryLangs.push(opts.prefer);
  if (opts?.fallbacks && opts.fallbacks.length) tryLangs.push(...opts.fallbacks);

  // Ensure we try common languages after specific prefs (dedup preserves order)
  const order = Array.from(new Set<LangCode>([...tryLangs, "fr", "en", "ht"]));

  for (const l of order) {
    const v = (t as any)[l];
    if (typeof v === "string" && v.trim()) return v;
  }

  // Last resorts
  if (typeof t.fr === "string" && t.fr) return t.fr;
  if (typeof t.en === "string" && t.en) return t.en;
  if (typeof t.ht === "string" && t.ht) return t.ht;
  if (Array.isArray(t.aliases) && t.aliases[0]) return t.aliases[0];
  return "Sans titre";
}
