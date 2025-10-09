import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
// import { SONGS } from "../data/songs";
import { useLibrary } from "../store/library";
import type { LangCode, Stanza } from "../types/song";
import { readJSON, writeJSON } from "../lib/storage";
import FavoriteButton from "../components/FavoriteButton";
import { useSettings } from "../store/settings";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { pickTitle } from "../lib/pickTitle";
import { bumpView, addDwell } from "../lib/engagement";





function labelFor(stanza: Stanza): string {
  if (stanza.kind === "chorus") return "Refrain";
  if (stanza.kind === "verse") return typeof stanza.n === "number" ? `Couplet ${stanza.n}` : "Couplet";
  if (stanza.kind === "bridge") return "Pont";
  return "";
}
// function titleFor(song: { titles: Partial<Record<LangCode, string>> }): string {
//   return song.titles.fr || song.titles.en || song.titles.ht || "Sans titre";
// }

const ZOOM_KEY = "cds:zoom:v1";
const MIN_FONT = 16, MAX_FONT = 36, STEP = 2;

export default function Lyrics() {
  const { id } = useParams<{ id: string }>();
  const { songs, status, error } = useLibrary();

  const { settings } = useSettings();
  
  

  if (status === "loading") {
    return <div className="safe-top px-4 py-6">Chargement du chant…</div>;
  }

  if (status === "error") {
  return (
    <div className="safe-top px-4 py-6">
      <p className="mb-2">Erreur de chargement de la bibliothèque.</p>
      <pre className="text-xs text-black/70 bg-white/70 p-2 rounded border border-black/10">
        {String(error || "Inconnue")}
      </pre>
      <p className="mt-3 text-sm">
        Ouvrez <code>songs.v1.json</code> dans le navigateur pour vérifier le fichier.
      </p>
    </div>
  );
}

const song = useMemo(() => songs.find((s) => s.id === id), [songs, id]);

  if (!song) {
    return (
      <div className="safe-top px-4 py-6">
        <p className="mb-4">Chant introuvable.</p>
        <Link to="/" className="underline">Retour à l’accueil</Link>
      </div>
    );
  }

  // --- Initial language: prefer user setting if song has it, else fallback FR→EN→HT
  const initialLang: LangCode = (() => {
    const pref = settings.preferredLanguage;
    const has = (lc: LangCode) => song.hasLanguages.includes(lc);
    if (pref !== "auto" && has(pref as LangCode)) return pref as LangCode;
    if (has("fr")) return "fr";
    if (has("en")) return "en";
    return has("ht") ? "ht" : (song.hasLanguages[0] as LangCode);
  })();
  const [lang, setLang] = useState<LangCode>(initialLang);

  const currentStanzas = useMemo(() => {
    const same = song.stanzas.filter((s) => s.lang === lang);
    return same.length ? same : song.stanzas;
  }, [song, lang]);

  const [index, setIndex] = useState(0);
  const total = currentStanzas.length;
  const atStart = index <= 0, atEnd = index >= total - 1;
  const goPrev = () => !atStart && setIndex((i) => i - 1);
  const goNext = () => !atEnd && setIndex((i) => i + 1);

  // email to receive flags
  const FLAG_EMAIL = "florialrudshadson@yahoo.com";

// prefilled mailtp 
const titleForEmail =
  pickTitle(song, { prefer: lang, fallbacks: song.hasLanguages as LangCode[] }) || "Sans titre";

const appVersion = (globalThis as any)?.__APP_VERSION__ || "dev";
const ua = (globalThis as any)?.navigator?.userAgent || "";
const uiLang = (globalThis as any)?.navigator?.language || "";
const songUrl = (globalThis as any)?.location?.href || "";

const mailSubject = `CDS Flag – ${song.id} – ${titleForEmail}`;
const mailBody =
  `Song ID: ${song.id}\n` +
  `Title: ${titleForEmail}\n` +
  `Language (view): ${lang}\n` +
  `App Version: ${appVersion}\n` +
  `UI Lang: ${uiLang}\n` +
  `URL: ${songUrl}\n` +
  `User-Agent: ${ua}\n` +
  `---\n` +
  `Describe the issue (optional):\n`;

const mailHref =
  `mailto:${FLAG_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

function flagSong() {
  // opens native Mail on iOS/Android; default mail client on desktop
  window.location.href = mailHref;
}



  if (total === 0) {
  return (
    <div className="safe-top px-4 py-6">
      <p className="mb-2">Ce chant n’a pas encore de paroles.</p>
      <Link to="/" className="underline">Retour à l’accueil</Link>
    </div>
  );
}

  // --- Zoom (use saved value if exists; else use settings.defaultFontSize)
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = readJSON<number | null>(ZOOM_KEY, null);
    const base = typeof saved === "number" ? saved : settings.defaultFontSize;
    return Math.min(MAX_FONT, Math.max(MIN_FONT, base));
  });
  useEffect(() => {
    const clamped = Math.min(MAX_FONT, Math.max(MIN_FONT, fontSize));
    if (clamped !== fontSize) setFontSize(clamped);
    writeJSON(ZOOM_KEY, clamped);
  }, [fontSize]);

  const decZoom = () => setFontSize((s) => Math.max(MIN_FONT, s - STEP));
  const incZoom = () => setFontSize((s) => Math.min(MAX_FONT, s + STEP));
  // const resetZoomToDefault = () => setFontSize(Math.min(MAX_FONT, Math.max(MIN_FONT, settings.defaultFontSize)));
  // const setCurrentAsDefault = () => setDefaultFontSize(fontSize);

  // --- Language switch helpers
  const available = song.hasLanguages;
  const canFR = available.includes("fr"), canEN = available.includes("en"), canHT = available.includes("ht");
  function alignedIndexFor(source: Stanza, target: Stanza[], fallbackIndex: number): number {
    if (!target.length) return 0;
    const hasN = typeof source.n === "number";
    let idx = target.findIndex((s) => s.kind === source.kind && (!hasN || s.n === source.n));
    if (idx !== -1) return idx;
    if (source.kind === "chorus") {
      idx = target.findIndex((s) => s.kind === "chorus");
      if (idx !== -1) return idx;
    }
    return Math.min(fallbackIndex, target.length - 1);
  }
  function switchLang(target: LangCode) {
    if (target === lang || !available.includes(target)) return;
    const targetStanzas = song!.stanzas.filter((s) => s.lang === target);
    if (!targetStanzas.length) return;
    const newIdx = alignedIndexFor(currentStanzas[index], targetStanzas, index);
    setLang(target); setIndex(newIdx);
  }
  function cycleLang() {
    const order = (["fr","en","ht"] as LangCode[]).filter((c) => available.includes(c));
    if (order.length <= 1) return;
    const at = order.indexOf(lang);
    const next = order[(at + 1) % order.length];
    switchLang(next);
  }

  // --- Engagement tracking
  // bump views on open and record dwell time on leave
    useEffect(() => {
      if (!song?.id) return;
      bumpView(song.id);
      const start = Date.now();
      return () => {
        const sec = (Date.now() - start) / 1000;
        if (sec >= 5) addDwell(song.id, sec);
      };
    }, [song?.id]);


  // --- Presentation Mode (unchanged core)
  const [isPresenting, setIsPresenting] = useState(false);
  const [mask, setMask] = useState<"none"|"black"|"white">("none");
  const [hudVisible, setHudVisible] = useState(true);
  const hudTimer = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  function pokeHUD(){ setHudVisible(true); if (hudTimer.current) window.clearTimeout(hudTimer.current); hudTimer.current = window.setTimeout(() => setHudVisible(false), 2000); }
  async function acquireWakeLock(){ try { const n:any = navigator; if (n.wakeLock && document.visibilityState==="visible") { wakeLockRef.current = await n.wakeLock.request("screen"); } } catch {} }
  async function releaseWakeLock(){ try { await wakeLockRef.current?.release?.(); } catch {} finally { wakeLockRef.current = null; } }
  function enterPresentation(){ setIsPresenting(true); setMask("none"); pokeHUD(); }
  async function exitPresentation(){ setIsPresenting(false); setMask("none"); try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {} await releaseWakeLock(); }
  useEffect(() => { if (!isPresenting) return; (async () => { try { await document.documentElement.requestFullscreen?.(); } catch {} await acquireWakeLock(); })(); }, [isPresenting]);
  useEffect(() => { const onFS = () => { if (!document.fullscreenElement) { setIsPresenting(false); setMask("none"); releaseWakeLock(); } }; document.addEventListener("fullscreenchange", onFS); return () => document.removeEventListener("fullscreenchange", onFS); }, []);
  useEffect(() => { if (!isPresenting) return; const onVis = () => { if (document.visibilityState === "visible") acquireWakeLock(); }; document.addEventListener("visibilitychange", onVis); return () => document.removeEventListener("visibilitychange", onVis); }, [isPresenting]);
  useEffect(() => {
    if (!isPresenting) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(k)) e.preventDefault();
      if (k === "ArrowRight" || k === "d" || k === "D") { goNext(); pokeHUD(); return; }
      if (k === "ArrowLeft"  || k === "a" || k === "A") { goPrev(); pokeHUD(); return; }
      if (k === "+" || k === "=") { incZoom(); pokeHUD(); return; }
      if (k === "-" || k === "_") { decZoom(); pokeHUD(); return; }
      if (k === "l" || k === "L") { cycleLang(); pokeHUD(); return; }
      if (k === "b" || k === "B") { setMask((m) => (m === "black" ? "none" : "black")); pokeHUD(); return; }
      if (k === "w" || k === "W") { setMask((m) => (m === "white" ? "none" : "white")); pokeHUD(); return; }
      if (k === "Escape") { exitPresentation(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresenting, index, lang, fontSize]);

  const stanza = currentStanzas[index];

  return (
    <div className="safe-top min-h-screen flex flex-col" style={{ background: "#e2eee4" }}>
      {/* Top bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <Link to="/" aria-label="Retour à l’accueil" className="rounded-lg p-1.5 hover:bg-black/5">
            <ChevronLeft size={22} style={{ color: "#000" }} />
        </Link>

        <div className="flex-1 text-center">
         <h1 className="text-base font-semibold uppercase" style={{ color: "#000" }}>
          {pickTitle(song, { prefer: lang, fallbacks: song.hasLanguages as LangCode[] })}
        </h1>
        </div>

        <div className="flex items-center gap-2">
            {/* flag */}
            <button
              onClick={flagSong}
              className="rounded-full border border-black/10 bg-white p-2 shadow-sm"
              style={{ color: "#000" }}
              aria-label="Signaler un problème"
              title="Signaler un problème"
              >
              <Flag size={18} />
            </button>

          <FavoriteButton songId={song.id} />
          {/* Language switch */}
          <div className="flex items-center gap-1">
            <button onClick={() => switchLang("fr")} disabled={!canFR} className="px-2 py-1 text-xs rounded border"
              style={{ background: lang==="fr"?"#417956":"#fff", color: lang==="fr"?"#fff": (canFR?"#000":"rgba(0,0,0,0.35)"), borderColor:"rgba(0,0,0,0.15)", opacity: canFR?1:0.5 }}>
              FR
            </button>
            <button onClick={() => switchLang("en")} disabled={!canEN} className="px-2 py-1 text-xs rounded border"
              style={{ background: lang==="en"?"#417956":"#fff", color: lang==="en"?"#fff": (canEN?"#000":"rgba(0,0,0,0.35)"), borderColor:"rgba(0,0,0,0.15)", opacity: canEN?1:0.5 }}>
              EN
            </button>
            <button onClick={() => switchLang("ht")} disabled={!canHT} className="px-2 py-1 text-xs rounded border"
              style={{ background: lang==="ht"?"#417956":"#fff", color: lang==="ht"?"#fff": (canHT?"#000":"rgba(0,0,0,0.35)"), borderColor:"rgba(0,0,0,0.15)", opacity: canHT?1:0.5 }}>
              HT
            </button>
          </div>
          <button onClick={enterPresentation} className="ml-1 hidden lg:inline-flex px-2.5 py-1.5 text-xs rounded border"
            style={{ background:"#fff", color:"#000", borderColor:"rgba(0,0,0,0.15)" }} title="Mode présentation (plein écran)">
            Présenter ⤢
          </button>
        </div>
      </div>

      {/* Stanza area */}
      <main className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-black/60">{labelFor(stanza)}</div>
          <pre className="whitespace-pre-wrap leading-relaxed" style={{ color:"#000", fontSize:`${fontSize}px`, lineHeight:1.6 }}>
            {stanza.text}
          </pre>
        </div>
      </main>

      {/* Pager + Zoom */}
      <footer className="px-4 pb-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} aria-hidden className="inline-block rounded-full"
              style={{ width:8, height:8, background: i===index ? "#417956" : "rgba(0,0,0,0.25)" }} />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={goPrev}
            disabled={atStart}
            className="rounded-full border border-black/10 bg-white p-2.5 shadow-sm disabled:opacity-50"
            style={{ color: "#000" }}
            aria-label="Précédent"
            title="Précédent"
            >
            <ChevronLeft size={20} />
        </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 mx-2">
            <button onClick={decZoom} disabled={fontSize <= MIN_FONT} className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm disabled:opacity-50" style={{ color:"#000" }}>−</button>
            <div className="text-sm text-black/70 select-none" aria-live="polite">{fontSize}px</div>
            <button onClick={incZoom} disabled={fontSize >= MAX_FONT} className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm disabled:opacity-50" style={{ color:"#000" }}>+</button>

            
            {/* <button onClick={resetZoomToDefault} className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm" style={{ color:"#000" }} title="Réinitialiser à la taille par défaut">
              Réinit.
            </button> */}
            {/* <button onClick={setCurrentAsDefault} className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm" style={{ color:"#000" }} title="Définir la taille actuelle comme défaut">
              Définir par défaut
            </button> */}
          </div>

          <button
            onClick={goNext}
            disabled={atEnd}
            className="rounded-full border border-black/10 bg-white p-2.5 shadow-sm disabled:opacity-50"
            style={{ color: "#000" }}
            aria-label="Suivant"
            title="Suivant"
            >
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ height: "var(--safe-bottom)" }} />
      </footer>

      {/* Presentation overlay (unchanged visuals) */}
      {isPresenting && (
        <div className="fixed inset-0 z-[9999] select-none" style={{ background: mask==="black"?"#000": mask==="white"?"#fff":"#e2eee4" }} onMouseMove={pokeHUD} onClick={pokeHUD}>
          <div className="absolute top-3 right-3 transition-opacity" style={{ opacity: hudVisible ? 1 : 0 }} aria-hidden={!hudVisible}>
            <div className="flex items-center gap-2 bg-white/85 backdrop-blur rounded-xl border border-black/10 p-2 shadow">
              <button onClick={goPrev} disabled={atStart} className="px-3 py-1.5 rounded border">◀︎</button>
              <button onClick={goNext} disabled={atEnd} className="px-3 py-1.5 rounded border">▶︎</button>
              <button onClick={decZoom} className="px-2.5 py-1.5 rounded border">A−</button>
              <button onClick={incZoom} className="px-2.5 py-1.5 rounded border">A+</button>
              <button onClick={() => switchLang("fr")} disabled={!canFR} className="px-2 py-1 text-xs rounded border" title="FR">FR</button>
              <button onClick={() => switchLang("en")} disabled={!canEN} className="px-2 py-1 text-xs rounded border" title="EN">EN</button>
              <button onClick={() => switchLang("ht")} disabled={!canHT} className="px-2 py-1 text-xs rounded border" title="HT">HT</button>
              <button onClick={() => setMask((m)=> (m==="black"?"none":"black"))} className="px-2.5 py-1.5 rounded border">B</button>
              <button onClick={() => setMask((m)=> (m==="white"?"none":"white"))} className="px-2.5 py-1.5 rounded border">W</button>
              <button onClick={exitPresentation} className="ml-1 px-3 py-1.5 rounded border" title="Quitter (Esc)">Quitter</button>

            </div>
          </div>
          <div className="h-full w-full grid place-items-center px-6">
            <div className="max-w-4xl w-full">
              <div className="mb-3 text-sm font-medium uppercase tracking-wide" style={{ color: mask==="black"?"#fff":"#000", opacity: 0.8 }}>{labelFor(stanza)}</div>
              <pre className="whitespace-pre-wrap" style={{ color: mask==="black"?"#fff":"#000", fontSize:`${Math.max(fontSize, 24)}px`, lineHeight:1.6 }}>
                {stanza.text}
              </pre>
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded bg-white/70 border border-black/10 shadow transition-opacity" style={{ opacity: hudVisible ? 1 : 0, color:"#000" }}>
            Raccourcis : ←/→, +/−, L, B, W, Échap
          </div>
        </div>
      )}
    </div>
  );
}
