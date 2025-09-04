import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { Song, Stanza, LangCode } from "../types/song";
import { useSettings } from "./settings";
import { useLibrary } from "./library";

/* Normalizer */
export function normalize(input: string): string {
  return (input ?? "").toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[`´’'"]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ").trim();
}

/* Context */
export type LangFilter = "all" | "fr" | "en" | "ht";
type SearchCtxValue = {
  query: string; setQuery: (q: string) => void;
  langFilter: LangFilter; setLangFilter: (f: LangFilter) => void;
};
const SearchCtx = createContext<SearchCtxValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [langFilter, setLangFilter] = useState<LangFilter>("all");

  // Initialize the language chip from Settings on first mount
  useEffect(() => {
    if (langFilter !== "all") return; // user already picked something
    const p = settings.preferredLanguage;
    if (p !== "auto") setLangFilter(p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const value = useMemo(() => ({ query, setQuery, langFilter, setLangFilter }), [query, langFilter]);
  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchCtx);
  if (ctx) return ctx;
  const [query, setQuery] = useState(""); const [langFilter, setLangFilter] = useState<LangFilter>("all");
  return { query, setQuery, langFilter, setLangFilter };
}

/* Results (simple/safe) */
export type SearchHit = {
  song: Song; score: number; source: "title" | "chorus" | "verse";
  lang?: LangCode; snippet: string; snippetHTML: string;
};
function titleOf(song: Song) { return song.titles.fr || song.titles.en || song.titles.ht || "Sans titre"; }
function findTitleMatch(song: Song, tokens: string[]) {
  const candidates = [song.titles?.fr ?? "", song.titles?.en ?? "", song.titles?.ht ?? "", ...(song.titles?.aliases ?? [])]
    .filter((t): t is string => typeof t === "string" && t.length > 0);
  for (const t of candidates) if (tokens.every((tk) => normalize(t).includes(tk))) return t;
  return null;
}
function findStanzaMatch(song: Song, tokens: string[]) {
  const stanzas = Array.isArray(song.stanzas) ? song.stanzas : [];
  const ordered = stanzas.slice().sort((a, b) => (a?.kind === "chorus" ? -1 : 0) - (b?.kind === "chorus" ? -1 : 0));
  for (const s of ordered) {
    if (!s || typeof s.text !== "string") continue;
    if (tokens.every((tk) => normalize(s.text).includes(tk))) return s;
  }
  return null;
}
function snippetFromStanza(s: Stanza, tokens: string[]) {
  const lines = (s.text || "").split("\n").map((l) => l.trim());
  const idx = Math.max(0, lines.findIndex((ln) => tokens.some((tk) => normalize(ln).includes(tk))));
  const two = lines.slice(idx, idx + 2).filter(Boolean);
  return two.length ? two.join(" · ") : lines.slice(0, 2).join(" · ");
}
export function useSearchResults(query: string) {
  const { songs } = useLibrary();

  return useMemo<SearchHit[]>(() => {
    try {
      const q = (query ?? "").trim();
      if (!q || songs.length === 0) return [];

      const tokens = normalize(q).split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return [];

      const results: SearchHit[] = [];

      for (const song of songs) {
        if (!song || typeof song.id !== "string" || !song.id.trim()) continue;

        const titleHit = findTitleMatch(song, tokens);
        const stanzaHit = findStanzaMatch(song, tokens);
        if (!titleHit && !stanzaHit) continue;

        if (titleHit) {
          results.push({
            song,
            score: 100,
            source: "title",
            snippet: titleHit,
            snippetHTML: titleHit,
          });
          continue;
        }

        const snippet = snippetFromStanza(stanzaHit!, tokens);
        results.push({
          song,
          score: stanzaHit!.kind === "chorus" ? 80 : 60,
          source: stanzaHit!.kind === "chorus" ? "chorus" : "verse",
          lang: stanzaHit!.lang,
          snippet,
          snippetHTML: snippet,
        });
      }

      // Final safety filter (no invalid hits)
      const safe = results.filter(
        (h) =>
          h &&
          h.song &&
          typeof h.song.id === "string" &&
          h.song.id.trim().length > 0
      );

      // Sort
      return safe.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return titleOf(a.song).toLowerCase().localeCompare(titleOf(b.song).toLowerCase());
      });
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
  }, [query, songs]);
}
