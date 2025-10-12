import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLibrary } from "../store/library";
import { useSearch } from "../store/search";
import { useSettings } from "../store/settings";
import { pickTitle } from "../lib/pickTitle";
import SongCard from "../components/SongCard";
import LanguageChips from "../components/LanguageChips";
import type { LangCode } from "../types/song";
import { useT } from "../lib/i18n";

const PER_PAGE = 25;

export default function Explore() {
  const { songs, status, error } = useLibrary();
  const { langFilter } = useSearch();
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const t = useT();

  // Read page from URL (?p=), default 1
  const pageParam = Math.max(1, parseInt(params.get("p") || "1", 10) || 1);

  // Build filtered + sorted list (keeps your existing behavior)
  const list = useMemo(() => {
    const base =
      langFilter === "all"
        ? songs
        : songs.filter((s) => s.hasLanguages.includes(langFilter));

    const prefer: LangCode | undefined =
      settings.preferredLanguage !== "auto"
        ? (settings.preferredLanguage as LangCode)
        : undefined;

    // Stable, accent-insensitive sort by display title
    return [...base].sort((a, b) => {
      const ta = pickTitle(a, {
        prefer,
        fallbacks: a.hasLanguages as LangCode[],
      });
      const tb = pickTitle(b, {
        prefer,
        fallbacks: b.hasLanguages as LangCode[],
      });
      return ta.localeCompare(tb, undefined, { sensitivity: "base" });
    });
  }, [songs, langFilter, settings.preferredLanguage]);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pageParam, totalPages);
  const start = (page - 1) * PER_PAGE;
  const end = Math.min(start + PER_PAGE, total);
  const slice = list.slice(start, end);

  // If URL page is out of range (e.g., filter reduced results), clamp it
  useEffect(() => {
    if (page !== pageParam) {
      const next = new URLSearchParams(params);
      next.set("p", String(page));
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageParam]);

  // When language filter changes, reset to page 1
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (next.get("p") !== "1") {
      next.set("p", "1");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langFilter]);

  // Scroll to top on page or language change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, langFilter]);

  const goPrev = () => {
    if (page <= 1) return;
    const next = new URLSearchParams(params);
    next.set("p", String(page - 1));
    setParams(next);
  };

  const goNext = () => {
    if (page >= totalPages) return;
    const next = new URLSearchParams(params);
    next.set("p", String(page + 1));
    setParams(next);
  };

  if (status === "loading") {
    return <div className="safe-top px-4 pb-6">{t("exploreSongsLoading")}</div>;
  }
  if (status === "error") {
    return (
      <div className="safe-top px-4 py-6">
        <p className="mb-2">{t("loadingdError")}</p>
        <pre className="text-xs text-black/70 bg-white/70 p-2 rounded border border-black/10">
          {String(error || "Inconnue")}
        </pre>
      </div>
    );
  }

  return (
    <div
      className="safe-top px-4 pb-6"
      style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-semibold" style={{ color: "#000" }}>
          {t("explore")}
        </h1>
        {/* <div className="text-xs text-black/60">{total} {t("exploreSongscount")}</div> */}
      </div>

      {/* Keep your language chips */}
      <LanguageChips />

      {slice.length === 0 ? (
        <p className="text-black/70 mt-2">{t("exploreNosongs")}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {slice.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded border disabled:opacity-50"
              style={{
                background: "#fff",
                color: "#000",
                borderColor: "rgba(0,0,0,0.15)",
              }}
            >
              {t("exploreback")}
            </button>
            <span className="text-sm text-black/70">
              {t("explorePage")} {page} / {totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded border disabled:opacity-50"
              style={{
                background: "#fff",
                color: "#000",
                borderColor: "rgba(0,0,0,0.15)",
              }}
            >
              {t("exploreforward")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
