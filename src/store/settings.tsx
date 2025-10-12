import React, { createContext, useContext, useMemo, useState } from "react";

export type PrefLang = "auto" | "fr" | "en" | "ht";
export type UiLanguage = "fr" | "en";

export type Settings = {
  // Lyrics-related preferences
  preferredLanguage: PrefLang;
  defaultFontSize: number; // baseline for Lyrics (A+/A− clamps still apply)
  // UI language (labels, placeholders, etc.)
  uiLanguage: UiLanguage;
};

const SETTINGS_KEY = "cds:settings:v1"; // keep same key for seamless migration
const ZOOM_KEY = "cds:zoom:v1";
const UI_SET_FLAG = "cds:settings:uiLangSetByUser"; // marks explicit user choice

// App-wide defaults (used as fallback)
const defaults: Settings = {
  preferredLanguage: "auto",
  defaultFontSize: 20,
  uiLanguage: "fr", // default UI in French
};

// Detect browser/system language (FR/EN only; fallback FR)
function detectBrowserUiLang(): "fr" | "en" {
  try {
    const tag = (navigator?.language || navigator?.languages?.[0] || "fr").toLowerCase();
    if (tag.startsWith("en")) return "en";
    if (tag.startsWith("fr")) return "fr";
  } catch {}
  return "fr";
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);

    // First run → seed from system/browser language (FR/EN) instead of hardcoded default
    if (!raw) {
      return {
        preferredLanguage: "auto",
        defaultFontSize: 20,
        uiLanguage: detectBrowserUiLang(),
      };
    }

    const obj = JSON.parse(raw) ?? {};

    // Build the settings with safe fallbacks (migrates older saves automatically)
    const s: Settings = {
      preferredLanguage: (obj.preferredLanguage ?? defaults.preferredLanguage) as PrefLang,
      defaultFontSize: Number.isFinite(obj.defaultFontSize) ? Number(obj.defaultFontSize) : defaults.defaultFontSize,
      // If uiLanguage wasn’t saved yet, detect from browser
      uiLanguage: (obj.uiLanguage ?? detectBrowserUiLang()) as UiLanguage,
    };

    // Guard invalid values
    if (!["auto", "fr", "en", "ht"].includes(s.preferredLanguage)) s.preferredLanguage = "auto";
    if (!["fr", "en"].includes(s.uiLanguage)) s.uiLanguage = "fr";
    if (!Number.isFinite(s.defaultFontSize)) s.defaultFontSize = defaults.defaultFontSize;

    // Clamp font size to sensible bounds (matches Lyrics page behavior)
    s.defaultFontSize = Math.min(36, Math.max(16, Math.round(s.defaultFontSize)));

    return s;
  } catch {
    // If anything goes wrong, fall back to FR
    return {
      preferredLanguage: "auto",
      defaultFontSize: 20,
      uiLanguage: "fr",
    };
  }
}

function save(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore quota / privacy mode errors
  }
}

type Ctx = {
  settings: Settings;
  setPreferredLanguage: (p: PrefLang) => void;
  setDefaultFontSize: (n: number) => void;
  setUiLanguage: (lang: UiLanguage) => void;
  clearLyricsZoom: () => void; // removes cds:zoom:v1 so Lyrics uses the default next open
};

const SettingsCtx = createContext<Ctx | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load());

  const value: Ctx = useMemo(
    () => ({
      settings,
      setPreferredLanguage: (p) => {
        const next: Settings = { ...settings, preferredLanguage: p };
        setSettings(next);
        save(next);
      },
      setDefaultFontSize: (n) => {
        const clamped = Math.min(36, Math.max(16, Math.round(Number(n))));
        const next: Settings = { ...settings, defaultFontSize: clamped };
        setSettings(next);
        save(next);
      },
      setUiLanguage: (lang) => {
        const safe: UiLanguage = lang === "en" ? "en" : "fr";
        const next: Settings = { ...settings, uiLanguage: safe };
        setSettings(next);
        save(next);
        try {
          localStorage.setItem(UI_SET_FLAG, "yes"); // remember user explicitly chose
        } catch {}
      },
      clearLyricsZoom: () => {
        try {
          localStorage.removeItem(ZOOM_KEY);
        } catch {
          // ignore
        }
      },
    }),
    [settings]
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
