import type { Song } from "../types/song";

export interface HitStats {
  views: number;
  lastViewedAt: number; // ms epoch
  dwellSec?: number;    // cumulative
}
export type StatsMap = Record<string, HitStats>;
const KEY = "cds:engagement:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

export function readStats(): StatsMap {
  return safeParse<StatsMap>(localStorage.getItem(KEY), {});
}
export function writeStats(m: StatsMap): void {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}
export function bumpView(id: string): void {
  const m = readStats();
  const now = Date.now();
  const s = m[id] ?? { views: 0, lastViewedAt: 0, dwellSec: 0 };
  s.views += 1;
  s.lastViewedAt = now;
  m[id] = s;
  writeStats(m);
}
export function addDwell(id: string, seconds: number): void {
  const m = readStats();
  const s = m[id] ?? { views: 0, lastViewedAt: 0, dwellSec: 0 };
  s.dwellSec = (s.dwellSec ?? 0) + Math.max(0, Math.floor(seconds));
  m[id] = s;
  writeStats(m);
}
export function pruneUnknown(validIds: string[]): void {
  const set = new Set(validIds);
  const m = readStats();
  let dirty = false;
  for (const id of Object.keys(m)) {
    if (!set.has(id)) { delete m[id]; dirty = true; }
  }
  if (dirty) writeStats(m);
}

// tiny PRNG for stable shuffles
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function scoreSong(
  song: Song,
  st?: HitStats,
  isFavorite?: boolean
): number {
  const views = st?.views ?? 0;
  const dwell = st?.dwellSec ?? 0;

  let daysSince = Infinity;
  if (st?.lastViewedAt) {
    daysSince = (Date.now() - st.lastViewedAt) / 86400000;
  }
  const recency = isFinite(daysSince) ? Math.exp(-daysSince / 14) : 0.4;

  // Base weights (tweakable)
  const base = 0;
  const wViews = 2 * views;
  const wFav = (isFavorite ? 1 : 0) * 5;
  const wPopular = (song.popular ? 1 : 0) * 3;
  const wDwell = Math.min(dwell, 600) * 0.02; // cap at 10 min

  // If no history at all, give small nudge so popular can lead
  const hasHistory = views > 0 || dwell > 0;
  const starter = hasHistory ? 0 : (song.popular ? 1.2 : 1.0);

  return (base + wViews + wFav + wPopular + wDwell + starter) * recency;
}
