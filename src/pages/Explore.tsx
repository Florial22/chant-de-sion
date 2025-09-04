import { useMemo, useState } from "react";
import { useLibrary } from "../store/library";
import { useSearch } from "../store/search";
import { useSettings } from "../store/settings";
import { pickTitle } from "../lib/pickTitle";
import SongCard from "../components/SongCard";
import LanguageChips from "../components/LanguageChips";
import type { LangCode } from "../types/song";

const PAGE_SIZE = 24;

export default function Explore() {
  const { songs, status } = useLibrary();
  const { langFilter } = useSearch();
  const { settings } = useSettings();
  const [limit, setLimit] = useState(PAGE_SIZE);

  const list = useMemo(() => {
    const base =
      langFilter === "all"
        ? songs
        : songs.filter((s) => s.hasLanguages.includes(langFilter));
    const prefer =
      settings.preferredLanguage !== "auto"
        ? (settings.preferredLanguage as LangCode)
        : undefined;

    return [...base].sort((a, b) => {
      const ta = pickTitle(a, { prefer, fallbacks: a.hasLanguages as LangCode[] }).toLowerCase();
      const tb = pickTitle(b, { prefer, fallbacks: b.hasLanguages as LangCode[] }).toLowerCase();
      return ta.localeCompare(tb);
    });
  }, [songs, langFilter, settings.preferredLanguage]);

  if (status === "loading") {
    return <div className="safe-top px-4 pb-6">Chargement des chants…</div>;
  }

  const shown = list.slice(0, limit);
  const canLoadMore = limit < list.length;

  return (
    <div className="safe-top px-4 pb-6" style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-semibold" style={{ color:"#000" }}>Explorer</h1>
        <div className="text-xs text-black/60">{list.length} chants</div>
      </div>

      <LanguageChips />

      {shown.length === 0 ? (
        <p className="text-black/70 mt-2">Aucun chant pour cette langue.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {shown.map((song) => <SongCard key={song.id} song={song} />)}
          </div>

          {canLoadMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm"
                style={{ color:"#000" }}
              >
                Charger plus
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
