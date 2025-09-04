import React, { createContext, useContext, useMemo, useState } from "react";

export type PrefLang = "auto" | "fr" | "en" | "ht";

export type Settings = {
  preferredLanguage: PrefLang;
  defaultFontSize: number; // baseline for Lyrics (A+/A− clamps will still apply)
};

const SETTINGS_KEY = "cds:settings:v1";
const ZOOM_KEY = "cds:zoom:v1";

const defaults: Settings = {
  preferredLanguage: "auto",
  defaultFontSize: 20,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const obj = JSON.parse(raw);
    const s: Settings = {
      preferredLanguage: (obj?.preferredLanguage ?? "auto") as PrefLang,
      defaultFontSize: Number(obj?.defaultFontSize ?? 20),
    };
    if (!["auto", "fr", "en", "ht"].includes(s.preferredLanguage)) s.preferredLanguage = "auto";
    if (!Number.isFinite(s.defaultFontSize)) s.defaultFontSize = 20;
    return s;
  } catch {
    return defaults;
  }
}
function save(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

type Ctx = {
  settings: Settings;
  setPreferredLanguage: (p: PrefLang) => void;
  setDefaultFontSize: (n: number) => void;
  clearLyricsZoom: () => void; // removes cds:zoom:v1 so Lyrics uses the default next open
};

const SettingsCtx = createContext<Ctx | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load());

  const value: Ctx = useMemo(() => ({
    settings,
    setPreferredLanguage: (p) => {
      const next = { ...settings, preferredLanguage: p };
      setSettings(next); save(next);
    },
    setDefaultFontSize: (n) => {
      const clamped = Math.min(36, Math.max(16, Math.round(n)));
      const next = { ...settings, defaultFontSize: clamped };
      setSettings(next); save(next);
    },
    clearLyricsZoom: () => localStorage.removeItem(ZOOM_KEY),
  }), [settings]);

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
