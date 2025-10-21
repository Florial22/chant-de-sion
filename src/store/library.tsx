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

// ---- Fetch as you already do (absolute path + JSON guard)
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

// ---- Dedupe by song.id (keep first), log duplicates once
function dedupeSongs(input: Song[]): { unique: Song[]; dupCount: number } {
  const seen = new Map<string, number>(); // id -> first index
  const unique: Song[] = [];
  let dupCount = 0;

  input.forEach((s, idx) => {
    const rawId = (s?.id ?? "").toString().trim();
    if (!rawId) {
      console.warn(`[library] Skipped item with empty id at index ${idx}.`);
      return;
    }
    if (seen.has(rawId)) {
      dupCount++;
      // log first time we hit a duplicate id
      const firstIdx = seen.get(rawId)!;
      if (firstIdx !== -1) {
        console.warn(
          `[library] Duplicate id "${rawId}" at index ${idx} (first at index ${firstIdx}). Keeping the first and ignoring this one.`
        );
        // mark as already reported
        seen.set(rawId, -1);
      }
      return; // ignore duplicate occurrence
    }
    seen.set(rawId, idx);
    unique.push(s);
  });

  return { unique, dupCount };
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    setStatus("loading");
    setError(undefined);
    try {
      const raw = await fetchSongs();
      const { unique, dupCount } = dedupeSongs(raw);

      setSongs(unique);
      setStatus("ready");

      console.log(
        `[library] ready with ${unique.length} unique songs` +
          (dupCount ? ` (ignored ${dupCount} duplicates by id)` : "")
      );

      // Optional dev helper to inspect duplicates later in the console
      try {
        (window as any).__CDS_CHECK_DUPES = () => {
          const ids = new Map<string, number>();
          const dups: Record<string, number[]> = {};
          raw.forEach((s, i) => {
            const id = (s?.id || "").toString().trim();
            if (!id) return;
            if (ids.has(id)) {
              (dups[id] ||= [ids.get(id)!]).push(i);
            } else {
              ids.set(id, i);
            }
          });
          return dups;
        };
      } catch {}
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

  const value = useMemo(
    () => ({ songs, status, error, reload: load }),
    [songs, status, error]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within <LibraryProvider>");
  return ctx;
}
