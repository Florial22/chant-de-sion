import { useMemo } from "react";
import { useLibrary } from "../store/library";
import SongCard from "../components/SongCard";
import type { Song } from "../types/song";
import { readStats, scoreSong, mulberry32, dailySeed } from "../lib/engagement";
import { useSearch } from "../store/search";      // ← listen to query
import { normalize } from "../lib/normalize";     // ← normalization for search

// Try to read favorites from local storage without coupling to store internals
function readFavoriteSet(): Set<string> {
  const candidates = [
    "cds:favorites:v1",
    "cds:favorites",
    "favorites",
    "cds:fav:v1",
  ];
  for (const k of candidates) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set<string>(arr);
      if (arr && typeof arr === "object" && Array.isArray(arr.ids)) {
        return new Set<string>(arr.ids);
      }
    } catch {}
  }
  return new Set<string>();
}

// Build a normalized haystack per song (multi-language)
function haystack(song: Song): string {
  const bits: string[] = [];
  // titles (all langs)
  if (song.titles) {
    for (const v of Object.values(song.titles)) {
      if (typeof v === "string" && v.trim()) bits.push(v);
    }
  }
  // aliases
  if (song.aliases?.length) bits.push(...song.aliases);
  // tags
  if (song.tags?.length) bits.push(...song.tags);
  // every stanza text
  if (song.stanzas?.length) bits.push(...song.stanzas.map((s) => s.text));
  return normalize(bits.join(" \n "));
}

export default function Home() {
  const { songs, status, error } = useLibrary();
  const { query } = useSearch();

  const q = (query || "").trim();
  const nq = normalize(q);
  const isSearching = nq.length > 0;

  // ===== When searching: compute results
  const searchResults: Song[] = useMemo(() => {
    if (!isSearching || !Array.isArray(songs)) return [];
    const out: Song[] = [];
    for (const s of songs) {
      try {
        if (haystack(s).includes(nq)) out.push(s);
        if (out.length >= 100) break; // keep UI snappy
      } catch {}
    }
    return out;
  }, [isSearching, songs, nq]);

  // ===== When not searching: For-You mix (top 5 by score + 3 daily fresh)
  const forYou: Song[] = useMemo(() => {
    const TAKE = 8;
    const list = Array.isArray(songs) ? songs : [];
    if (list.length === 0) return [];

    const stats = readStats();
    const favs = readFavoriteSet();

    // If no engagement at all, show popular or random (first-run)
    const hasAnyHistory = Object.keys(stats).length > 0 || favs.size > 0;
    if (!hasAnyHistory) {
      const popular = list.filter((s) => s.popular === true).slice(0, TAKE);
      if (popular.length > 0) return popular;

      // random 8 using daily seed so it changes once per day
      const rng = mulberry32(dailySeed());
      const arr = [...list];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.slice(0, TAKE);
    }

    // 1) Score all songs
    const scored = list.map((song) => ({
      song,
      score: scoreSong(song, stats[song.id], favs.has(song.id)),
    }));

    // 2) Top 5 by score
    scored.sort((a, b) => b.score - a.score);
    const top5 = scored.slice(0, 5).map((x) => x.song);
    const topIds = new Set(top5.map((s) => s.id));

    // 3) Fresh daily picks from remaining pool, seeded by date
    const pool = scored.filter((x) => !topIds.has(x.song.id)).map((x) => x.song);
    const rng = mulberry32(dailySeed());
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const fresh = pool.slice(0, Math.max(0, 8 - top5.length));

    return [...top5, ...fresh].slice(0, TAKE);
  }, [songs]);

  if (status === "loading") {
    return <div className="safe-top px-4 py-6">Chargement…</div>;
  }
  if (status === "error") {
    return (
      <div className="safe-top px-4 py-6">
        <p className="mb-2">Erreur de chargement.</p>
        <pre className="text-xs text-black/70 bg-white/70 p-2 rounded border border-black/10">
          {String(error || "Inconnue")}
        </pre>
      </div>
    );
  }

  const list = isSearching ? searchResults : forYou;

  return (
    <div className="safe-top px-4 py-4" style={{ background: "#e2eee4" }}>
      {isSearching && (
        <div className="mb-2 text-sm text-black/60">
          Résultats pour{" "}
          <span className="font-medium" style={{ color: "#000" }}>
            “{q}”
          </span>{" "}
          — {list.length}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-4 text-sm text-black/60">
          {isSearching
            ? "Aucun chant ne correspond à votre recherche."
            : "Aucun chant trouvé."}
        </p>
      )}
    </div>
  );
}
