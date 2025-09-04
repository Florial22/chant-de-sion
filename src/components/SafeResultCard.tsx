import { useNavigate } from "react-router-dom";
import type { SearchHit } from "../store/search";
import type { LangCode, Song } from "../types/song";


function safeTitle(song?: Song, prefer?: LangCode): string {
  const t = (song?.titles ?? {}) as Record<string, string | string[]>;
  const order: LangCode[] = [];
  if (prefer) order.push(prefer);
  order.push("fr", "en", "ht");

  for (const l of order) {
    const v = t[l];
    if (typeof v === "string" && v.trim()) return v;
  }
  const aliases = t["aliases"];
  if (Array.isArray(aliases) && aliases[0]) return String(aliases[0]);
  return "Sans titre";
}

export default function SafeResultCard({ hit }: { hit: SearchHit }) {
  const navigate = useNavigate();

  try {
    const song = hit?.song;
    const id = song?.id ?? "";
    const canOpen = typeof id === "string" && id.trim().length > 0;

    const prefer = (hit?.lang as LangCode | undefined) || undefined;
    const title = safeTitle(song, prefer);
    const snippet = String(hit?.snippet ?? "");

    const open = () => {
      if (!canOpen) return;
      navigate(`/song/${encodeURIComponent(id)}`);
    };

    return (
      <button
        type="button"
        onClick={open}
        className="text-left block w-full rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition disabled:opacity-50"
        disabled={!canOpen}
      >
        <h3 className="font-semibold mb-1" style={{ color: "#000" }}>{title}</h3>
        <p className="text-sm text-black/80 line-clamp-2">{snippet}</p>
        {!canOpen && (
          <p className="mt-1 text-xs text-black/50">ID de chant manquant</p>
        )}
      </button>
    );
  } catch (e) {
    console.error("SafeResultCard render error:", e, hit);
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/70">
        Résultat invalide
      </div>
    );
  }
}
