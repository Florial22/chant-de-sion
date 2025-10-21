import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { Song, Stanza, LangCode } from "../types/song";
import { useSettings } from "./settings";
import { useLibrary } from "./library";

/* Normalizer */
export function normalize(input: string): string {
  return (input ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")       // strip diacritics
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
    .replace(/[´’'"]/g, "'")               // normalize quotes
    .replace(/[^a-z0-9\s']/g, " ")         // keep basic a-z/0-9/space/apos
    .replace(/\s+/g, " ")
    .trim();
}

/* Context */
export type LangFilter = "all" | "fr" | "en" | "ht";

type SearchCtxValue = {
  query: string;
  setQuery: (q: string) => void;
  langFilter: LangFilter;
  setLangFilter: (f: LangFilter) => void;
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

  const value = useMemo(
    () => ({ query, setQuery, langFilter, setLangFilter }),
    [query, langFilter]
  );

  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchCtx);
  if (ctx) return ctx;
  // Fallback (shouldn't happen if provider is mounted)
  const [query, setQuery] = useState("");
  const [langFilter, setLangFilter] = useState<LangFilter>("all");
  return { query, setQuery, langFilter, setLangFilter };
}

/* Results (simple/safe) */
export type SearchHit = {
  song: Song;
  score: number;
  source: "title" | "chorus" | "verse";
  lang?: LangCode;
  snippet: string;
  snippetHTML: string;
};

function titleOf(song: Song) {
  return song.titles.fr || song.titles.en || song.titles.ht || "Sans titre";
}

/** Build normalized tokens, ignoring 1-char tokens unless the whole query is 1 char */
function tokensFromQuery(q: string): string[] {
  const nq = normalize(q);
  if (!nq) return [];
  const parts = nq.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts; // allow single 1-char query
  // drop super-short tokens that cause noisy matches ("a", "l", "de", etc.)
  return parts.filter((t) => t.length >= 2);
}

function findTitleMatch(song: Song, tokens: string[]) {
  const candidates = [
    song.titles?.fr ?? "",
    song.titles?.en ?? "",
    song.titles?.ht ?? "",
    // FIX: aliases live on the root song object, not inside titles
    ...(Array.isArray((song as any).aliases) ? (song as any).aliases as string[] : []),
  ].filter((t): t is string => typeof t === "string" && t.length > 0);

  for (const t of candidates) {
    const nt = normalize(t);
    if (tokens.every((tk) => nt.includes(tk))) return t;
  }
  return null;
}

function findStanzaMatch(song: Song, tokens: string[]) {
  const stanzas = Array.isArray(song.stanzas) ? song.stanzas : [];
  // Put chorus first deterministically
  const ordered = stanzas.slice().sort((a, b) => {
    const pa = a?.kind === "chorus" ? 0 : 1;
    const pb = b?.kind === "chorus" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    // then by verse number if available for stability
    const na = typeof a?.n === "number" ? a.n! : 9999;
    const nb = typeof b?.n === "number" ? b.n! : 9999;
    return na - nb;
  });

  for (const s of ordered) {
    if (!s || typeof s.text !== "string") continue;
    const ns = normalize(s.text);
    if (tokens.every((tk) => ns.includes(tk))) return s;
  }
  return null;
}

function snippetFromStanza(s: Stanza, tokens: string[]) {
  const lines = (s.text || "").split("\n").map((l) => l.trim());
  // find the first line that contains any token (normalized)
  const idx = Math.max(
    0,
    lines.findIndex((ln) => {
      const nln = normalize(ln);
      return tokens.some((tk) => nln.includes(tk));
    })
  );
  const two = lines.slice(idx, idx + 2).filter(Boolean);
  return two.length ? two.join(" · ") : lines.slice(0, 2).join(" · ");
}

export function useSearchResults(query: string) {
  const { songs } = useLibrary();

  return useMemo<SearchHit[]>(() => {
    try {
      const tokens = tokensFromQuery(query);
      if (tokens.length === 0 || !Array.isArray(songs) || songs.length === 0) return [];

      const results: SearchHit[] = [];

      for (const song of songs) {
        if (!song || typeof song.id !== "string" || !song.id.trim()) continue;

        const titleHit = findTitleMatch(song, tokens);
        let stanzaHit: Stanza | null = null;

        if (!titleHit) {
          stanzaHit = findStanzaMatch(song, tokens);
          if (!stanzaHit) continue; // no match at all
        }

        if (titleHit) {
          const t = titleHit;
          results.push({
            song,
            score: 100,
            source: "title",
            snippet: t,
            snippetHTML: t,
          });
        } else {
          const s = stanzaHit!; // safe due to continue above
          const snippet = snippetFromStanza(s, tokens);
          results.push({
            song,
            score: s.kind === "chorus" ? 80 : 60,
            source: s.kind === "chorus" ? "chorus" : "verse",
            lang: s.lang as LangCode | undefined,
            snippet,
            snippetHTML: snippet,
          });
        }
      }

      // Deduplicate defensively by song id (should already be unique)
      const byId = new Map<string, SearchHit>();
      for (const h of results) {
        const id = h.song.id;
        const prev = byId.get(id);
        if (!prev || h.score > prev.score) byId.set(id, h);
      }
      const safe = Array.from(byId.values()).filter(
        (h) => h && h.song && typeof h.song.id === "string" && h.song.id.trim().length > 0
      );

      // Stable sort: score desc → title asc → id asc
      safe.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const ta = titleOf(a.song).toLowerCase();
        const tb = titleOf(b.song).toLowerCase();
        const tcmp = ta.localeCompare(tb);
        if (tcmp !== 0) return tcmp;
        return a.song.id.localeCompare(b.song.id);
      });

      return safe;
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
  }, [query, songs]);
}
