// src/pages/Home.tsx
import { useMemo } from "react";
import SongCard from "../components/SongCard";
import SafeResultCard from "../components/SafeResultCard";
import TinyBoundary from "../components/TinyBoundary";
import LanguageChips from "../components/LanguageChips";
import { useFavorites } from "../store/favorites";
import { useSearch, useSearchResults } from "../store/search";
import { useLibrary } from "../store/library";

function pickEight<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, 8);
}

export default function Home() {
  const { ids: favIds } = useFavorites();
  const { query } = useSearch();
  const { songs, status } = useLibrary();
  const rawResults = useSearchResults(query);

  const hasQuery = (query ?? "").trim().length > 0;

  // Safe results (defensive filter)
  const results = useMemo(
    () =>
      (Array.isArray(rawResults) ? rawResults : []).filter(
        (h) =>
          h &&
          h.song &&
          typeof h.song.id === "string" &&
          h.song.id.trim().length > 0
      ),
    [rawResults]
  );

  // Favorites from the loaded library
  const favSongs = useMemo(
    () => songs.filter((s) => favIds.includes(s.id)),
    [songs, favIds]
  );

  // Show up to 8 favorites; if none, show 8 random suggestions from the library
  const items = useMemo(() => {
    if (favSongs.length > 0) return favSongs.slice(0, 8);
    return pickEight(songs);
  }, [favSongs, songs]);

  if (status === "loading") {
    return (
      <div
        className="px-4"
        style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}
      >
        <h2 className="text-sm font-medium mb-2" style={{ color: "#000" }}>
          Chargement des chants…
        </h2>
      </div>
    );
  }

  if (hasQuery) {
    return (
      <div
        className="px-4"
        style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}
      >
        <h2 className="text-sm font-medium mb-2" style={{ color: "#000" }}>
          Résultats
        </h2>
        <LanguageChips />
        {results.length === 0 ? (
          <p className="text-black/70">Aucun résultat. Essayez d’autres mots.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((hit, idx) => {
              const safeKey = hit?.song?.id || `hit-${idx}`;
              return (
                <TinyBoundary key={safeKey}>
                  <SafeResultCard hit={hit} />
                </TinyBoundary>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="px-4"
      style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}
    >
      <h2 className="text-sm font-medium mb-2" style={{ color: "#000" }}>
        {favSongs.length > 0 ? "Vos favoris" : "Suggestions"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
