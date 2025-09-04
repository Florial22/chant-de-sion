// src/store/library.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Song } from "../types/song";

type Status = "loading" | "ready" | "error";

type LibraryCtx = {
  songs: Song[];
  status: Status;
  error?: string;
  reload: () => void;
};

const LibraryContext = createContext<LibraryCtx | undefined>(undefined);

async function fetchSongs(): Promise<Song[]> {
  const url = "/songs.v1.json"; // absolute path from site root

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);

  const text = await res.text();
  // guard against HTML fallback (e.g., SPA index)
  if (!(text.trim().startsWith("{") || text.trim().startsWith("["))) {
    throw new Error(`Not JSON @ ${url}: starts with "${text.slice(0, 15)}"`);
  }

  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data?.songs;
  if (!Array.isArray(arr)) throw new Error(`Bad JSON shape @ ${url}`);
  console.log(`[library] loaded ${arr.length} songs from ${url}`);
  return arr as Song[];
}






export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    setStatus("loading");
    setError(undefined);
    try {
      const s = await fetchSongs();
      setSongs(s);
      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Échec du chargement des chants");
      setSongs([]); // keep UI functional
    }
  };

  useEffect(() => {
    // let the shell paint first
    const id = requestAnimationFrame(load);
    return () => cancelAnimationFrame(id);
  }, []);

  const value = useMemo(() => ({ songs, status, error, reload: load }), [songs, status, error]);
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within <LibraryProvider>");
  return ctx;
}
