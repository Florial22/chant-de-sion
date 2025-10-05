import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useT } from "../lib/i18n";

const LIVE_JSON_URL = "https://zionsongs.netlify.app/live.v1.json";

type LiveStream = {
  id: string;
  name: string;
  url: string;
  platform?: "youtube" | "facebook" | "other";
  lang?: string[];
  city?: string;
  active?: boolean;
  logo?: string;
};

type Payload = { version?: number; streams?: LiveStream[] };

async function openExternal(url: string) {
  if (Capacitor?.isNativePlatform?.()) {
    try {
      const mod: any = await import("@capacitor/browser");
      await mod.Browser.open({ url });
      return;
    } catch {}
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function Live() {
  const t = useT();
  const [data, setData] = useState<Payload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setStatus("loading");
      setError("");
      try {
        const res = await fetch(`${LIVE_JSON_URL}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Payload;
        if (!alive) return;
        setData(json);
        setStatus("ok");
        try { localStorage.setItem("cds:channels:last", JSON.stringify(json)); } catch {}
      } catch (e: any) {
        // Fallback to last cached list if offline
        try {
          const raw = localStorage.getItem("cds:channels:last");
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
    return [...actives].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [data]);

  if (status === "loading" && !data) {
    return <div className="safe-top px-4 py-6">{t("loading")}</div>;
  }
  if (status === "error" && !data) {
    return (
      <div className="safe-top px-4 py-6">
        <p className="mb-2">{t("unableToLoadChannels")}</p>
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
        <h1 className="text-base font-semibold" style={{ color: "#000" }}>
          {t("channelsHeader")}
        </h1>
        <div className="text-xs text-black/60">{streams.length}</div>
      </div>

      {error && <div className="mb-2 text-xs text-amber-700">{error}</div>}

      {streams.length === 0 ? (
        <p className="text-black/70 mt-2">{t("channelsEmpty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {streams.map((s) => (
            <div key={s.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate" style={{ color: "#417956" }}>
                    {s.name}
                  </div>
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

              <div className="mt-3">
                <button
                  onClick={() => openExternal(s.url)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm"
                  style={{ color: "#000" }}
                >
                  {t("visitChannel")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
