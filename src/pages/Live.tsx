import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";

const CHECK_LIVE_URL = "https://admin-zion.netlify.app/.netlify/functions/check-live";

type LiveStream = {
  id: string;
  name: string;
  url: string;
  platform?: "youtube" | "facebook" | "other";
  lang?: string[];
  city?: string;
  active?: boolean;
  liveNow?: boolean;
  schedule?: { dow: string[]; time: string; tz: string }[];
  logo?: string;
};
type Payload = { version: number; checkedAt?: string; streams: LiveStream[] };

async function openExternal(url: string) {
  if (Capacitor && Capacitor.isNativePlatform?.()) {
    try {
      const mod: any = await import("@capacitor/browser");
      await mod.Browser.open({ url });
      return;
    } catch {}
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function Live() {
  const [data, setData] = useState<Payload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setStatus("loading");
      setError("");
      try {
        const res = await fetch(`${CHECK_LIVE_URL}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Payload;
        if (!alive) return;
        setData(json);
        setStatus("ok");
        try { localStorage.setItem("cds:live:last", JSON.stringify(json)); } catch {}
      } catch (e: any) {
        try {
          const raw = localStorage.getItem("cds:live:last");
          if (raw) {
            const fallback = JSON.parse(raw) as Payload;
            if (alive) {
              setData(fallback);
              setStatus("ok");
              setError("Hors ligne — données en cache affichées.");
            }
            return;
          }
        } catch {}
        if (alive) {
          setStatus("error");
          setError(e?.message || "Échec du chargement.");
        }
      }
    }
    load();
    const onVis = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const streams = useMemo(() => {
    const arr = data?.streams ?? [];
    const actives = arr.filter((s) => s.active !== false);
    return [...actives].sort((a, b) => {
      const la = a.liveNow ? 1 : 0;
      const lb = b.liveNow ? 1 : 0;
      if (la !== lb) return lb - la; // live first
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [data]);

  const liveCount = streams.filter((s) => s.liveNow).length;

  if (status === "loading" && !data) {
    return <div className="safe-top px-4 py-6">Chargement des directs…</div>;
  }
  if (status === "error" && !data) {
    return (
      <div className="safe-top px-4 py-6">
        <p className="mb-2">Impossible de charger la liste des directs.</p>
        <pre className="text-xs text-black/70 bg-white/70 p-2 rounded border border-black/10">{error}</pre>
      </div>
    );
  }

  return (
    <div
      className="safe-top px-4 pb-6"
      style={{ background: "#e2eee4", paddingBottom: "calc(64px + var(--safe-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-semibold" style={{ color: "#000" }}>En direct</h1>
        
      </div>

      {error && <div className="mb-2 text-xs text-amber-700">{error}</div>}

      {liveCount === 0 && (
        <div className="mb-2 text-sm text-black/70">Aucun direct en cours pour le moment.</div>
      )}

      {streams.length === 0 ? (
        <p className="text-black/70 mt-2">Aucun flux disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {streams.map((s) => (
            <div key={s.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate" style={{ color: "#417956" }}>{s.name}</div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                    {s.city && <span className="text-black/60">{s.city}</span>}
                    {s.lang?.length ? (
                      <span className="inline-flex gap-1">
                        {s.lang.map((l) => (
                          <span key={l} className="px-1.5 py-0.5 rounded border border-black/10 text-black/70">
                            {l.toUpperCase()}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        background: s.liveNow ? "#ef4444" : "rgba(0,0,0,0.08)",
                        color: s.liveNow ? "#fff" : "#000"
                      }}
                    >
                      {s.liveNow ? "EN DIRECT" : "Hors ligne"}
                    </span>
                  </div>
                </div>
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt=""
                    className="w-10 h-10 rounded object-cover border border-black/10"
                  />
                ) : null}
              </div>

              {s.schedule?.length ? (
                <div className="mt-2 text-xs text-black/60">
                  {s.schedule.map((slot, i) => (
                    <div key={i}>{slot.dow.join(", ")} · {slot.time} ({slot.tz})</div>
                  ))}
                </div>
              ) : null}

              <div className="mt-3">
                <button
                  onClick={() => openExternal(s.url)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm"
                  style={{ color: "#000" }}
                >
                  Regarder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
