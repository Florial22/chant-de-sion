import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Melody, MelodyCatalog } from "../types/melody";

type Status = "loading" | "ready" | "error";

type MelodiesContextValue = {
  status: Status;
  error?: string;
  melodies: Melody[];
  categories: string[];
  reload: () => void;
};

const MelodiesCtx = createContext<MelodiesContextValue | undefined>(undefined);

// Point to your Netlify JSON
const CATALOG_URL = "https://zionsongs.netlify.app/melodies.v1.json";

async function fetchCatalog(): Promise<MelodyCatalog> {
  const res = await fetch(`${CATALOG_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MelodyCatalog;
}

export function MelodiesProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string>();
  const [melodies, setMelodies] = useState<Melody[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const load = async () => {
    setStatus("loading");
    setError(undefined);
    try {
      const cat = await fetchCatalog();
      const list = Array.isArray(cat?.melodies) ? cat.melodies : [];

      // Dedupe by id
      const seen = new Set<string>();
      const unique = list.filter((m) => {
        const ok = m?.id && !seen.has(m.id);
        if (ok) seen.add(m.id);
        return ok;
      });

      setMelodies(unique);
      setCategories(cat?.categories ?? [...new Set(unique.map((m) => m.category))].sort());
      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Load error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const value = useMemo<MelodiesContextValue>(
    () => ({ status, error, melodies, categories, reload: load }),
    [status, error, melodies, categories]
  );

  return <MelodiesCtx.Provider value={value}>{children}</MelodiesCtx.Provider>;
}

export function useMelodies() {
  const ctx = useContext(MelodiesCtx);
  if (!ctx) throw new Error("useMelodies must be used within <MelodiesProvider>");
  return ctx;
}
