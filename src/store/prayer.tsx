import React, { createContext, useContext, useMemo, useState } from "react";
import type { LangCode, Song } from "../types/song";
import { readStats, scoreSong } from "../lib/engagement";
import { useLibrary } from "./library";

export type PrayerLangPref = "auto" | LangCode;
export type PrayerReminder = {
  id: string;
  time: string;             // "HH:MM" 24h
  days: number[];           // 0-6 (Sun=0), [] = every day
  langPref: PrayerLangPref; // "auto"|"fr"|"en"|"ht"
  count: 1 | 3;
  enabled: boolean;
  updatedAt: number;
};

export type PrayerState = {
  reminders: PrayerReminder[];
};

const KEY = "cds:prayer:v1";

function load(): PrayerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { reminders: [] };
    const obj = JSON.parse(raw);
    if (!Array.isArray(obj?.reminders)) return { reminders: [] };
    return { reminders: obj.reminders };
  } catch {
    return { reminders: [] };
  }
}

function save(state: PrayerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function genId() {
  // tiny id: pr- + 10 base36 chars
  return "pr-" + Math.random().toString(36).slice(2, 12);
}

type Ctx = {
  reminders: PrayerReminder[];
  add: (r: Omit<PrayerReminder, "id" | "updatedAt">) => void;
  update: (id: string, patch: Partial<PrayerReminder>) => void;
  remove: (id: string) => void;
  suggestFor: (opts: { langPref: PrayerLangPref; count: 1 | 3 }) => Song[]; // quick preview
};

const PrayerCtx = createContext<Ctx | undefined>(undefined);

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrayerState>(load());
  const { songs } = useLibrary();

  function commit(next: PrayerState) {
    setState(next);
    save(next);
  }

  const add: Ctx["add"] = (r) => {
    const rec: PrayerReminder = {
      id: genId(),
      updatedAt: Date.now(),
      ...r,
    };
    commit({ reminders: [rec, ...state.reminders] });
  };

  const update: Ctx["update"] = (id, patch) => {
    commit({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
      ),
    });
  };

  const remove: Ctx["remove"] = (id) => {
    commit({ reminders: state.reminders.filter((r) => r.id !== id) });
  };

  const suggestFor: Ctx["suggestFor"] = ({ langPref, count }) => {
    const list = Array.isArray(songs) ? songs : [];
    if (list.length === 0) return [];

    // language filter/fallback
    const has = (s: Song, lc: LangCode) => s.hasLanguages.includes(lc);
    const pickLangOrder = (lp: PrayerLangPref): LangCode[] => {
      if (lp === "auto") return ["fr", "en", "ht"] as LangCode[];
      return [lp as LangCode, "fr", "en", "ht"].filter(
        (v, i, a) => a.indexOf(v) === i
      ) as LangCode[];
    };
    const order = pickLangOrder(langPref);
    let pool: Song[] = [];
    for (const lc of order) {
      const subset = list.filter((s) => has(s, lc));
      if (subset.length) {
        pool = subset;
        break;
      }
    }
    if (pool.length === 0) pool = list;

    const stats = readStats();
    const scored = pool.map((song) => ({
      song,
      score: scoreSong(song, stats[song.id], false),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map((x) => x.song);
  };

  const value: Ctx = useMemo(
    () => ({
      reminders: state.reminders,
      add,
      update,
      remove,
      suggestFor,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, songs]
  );

  return <PrayerCtx.Provider value={value}>{children}</PrayerCtx.Provider>;
}

export function usePrayer() {
  const ctx = useContext(PrayerCtx);
  if (!ctx) throw new Error("usePrayer must be used within <PrayerProvider>");
  return ctx;
}
