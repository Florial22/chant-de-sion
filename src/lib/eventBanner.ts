// src/lib/eventBanner.ts
import { readJSON, writeJSON } from "./storage";

export type EventBannerData = {
  id: string;
  active?: boolean;
  title: string;
  message?: string;
  start?: string; // ISO
  end?: string;   // ISO
  location?: string;
  link?: string;
  autocloseSec?: number; // default 10
};

const STORAGE_LAST = "cds:banner:last:v1";

function safeDate(s?: string): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

export function isActive(b: EventBannerData, now = Date.now()): boolean {
  if (!b) return false;
  if (b.active === false) return false;
  const start = safeDate(b.start);
  const end = safeDate(b.end);
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export async function fetchBanner(url: string): Promise<EventBannerData | null> {
  // network-first, avoid PWA cache
  const cacheBust = Math.floor(Date.now() / 3_600_000); // 1/hour
  const sep = url.includes("?") ? "&" : "?";
  const full = `${url}${sep}t=${cacheBust}`;
  try {
    const res = await fetch(full, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as EventBannerData;
    // basic shape check
    if (!data || typeof data !== "object" || !data.id || !data.title) {
      throw new Error("Bad banner shape");
    }
    writeJSON(STORAGE_LAST, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    const last = readJSON<{ data: EventBannerData; fetchedAt: number } | null>(
      STORAGE_LAST,
      null
    );
    return last?.data ?? null;
  }
}
