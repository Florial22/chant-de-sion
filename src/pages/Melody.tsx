import { useEffect, useMemo, useState } from "react";
import { useMelodies } from "../store/melodies";
import { useAudioController } from "../hooks/useAudioController";
import { Play, Pause } from "lucide-react";
import { useT } from "../lib/i18n";

const BG = "#e2eee4";
const ACCENT = "#417956";
const PAGE_SIZE = 12;

export default function MelodyPage() {
  const { status, error, melodies, categories } = useMelodies();
  const { currentId, isPlaying, play, pause } = useAudioController();
  const [cat, setCat] = useState<string | "all">("all");
  const [page, setPage] = useState(1);
  const t = useT();

  // Filter by category
  const filtered = useMemo(
    () => (cat === "all" ? melodies : melodies.filter((m) => m.category === cat)),
    [melodies, cat]
  );

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filtered.slice(start, end);

  // Reset to page 1 when category changes or list changes drastically
  useEffect(() => {
    setPage(1);
  }, [cat]);

  if (status === "loading") return <div className="safe-top px-4 py-6">{t('loading')}</div>;
  if (status === "error")
    return (
      <div className="safe-top px-4 py-6">
        <p className="mb-2">{t('loadingdError')}</p>
        <pre className="text-xs text-black/70 bg-white/70 p-2 rounded border border-black/10">{error}</pre>
      </div>
    );

  return (
    <div
      className="safe-top px-4 pb-6"
      style={{ background: BG, paddingBottom: "calc(64px + var(--safe-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between mb-2">
        {/* <h1 className="text-base font-semibold" style={{ color: "#000" }}>
          Melody
        </h1> */}
        {/* <div className="text-xs text-black/60">
          {filtered.length} {filtered.length <= 1 ? "piste" : "pistes"}
        </div> */}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setCat("all")}
          className="px-3 py-1.5 text-xs rounded-full border"
          style={{
            background: cat === "all" ? ACCENT : "#fff",
            color: cat === "all" ? "#fff" : "#000",
            borderColor: "rgba(0,0,0,0.15)",
          }}
        >
          {t('chipsAll')}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="px-3 py-1.5 text-xs rounded-full border"
            style={{
              background: cat === c ? ACCENT : "#fff",
              color: cat === c ? "#fff" : "#000",
              borderColor: "rgba(0,0,0,0.15)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* List for the current page */}
      {pageItems.length === 0 ? (
        <p className="text-black/70 mt-2">{t('noneFound')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {pageItems.map((m) => {
            const active = currentId === m.id && isPlaying === true;
            return (
              <div
                key={m.id}
                className="rounded-2xl border bg-white p-4 shadow-sm flex items-center justify-between gap-3"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate" style={{ color: "#000" }}>
                    {m.title}
                  </div>
                  <div className="text-xs text-black/60">{m.category}</div>
                </div>

                <button
                  onClick={() => (active ? pause() : play(m.id, m.url, { title: m.title }))}
                  className="w-10 h-10 rounded-full border grid place-items-center"
                  style={{ borderColor: ACCENT }}
                  aria-label={active ? "Pause" : "Lecture"}
                >
                  {active ? <Pause size={20} color={ACCENT} /> : <Play size={20} color={ACCENT} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 shadow-sm disabled:opacity-50"
            style={{ color: "#000" }}
          >
            {t('exploreback')}
          </button>
          <div className="text-sm text-black/70">
            Page <span className="font-medium" style={{ color: "#000" }}>{safePage}</span> / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 shadow-sm disabled:opacity-50"
            style={{ color: "#000" }}
          >
            {t('exploreforward')}
          </button>
        </div>
      )}
    </div>
  );
}
