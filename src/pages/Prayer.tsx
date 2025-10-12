import { useAmbientAudio } from "../hooks/useAmbientAudio";
import {  useState } from "react";
import { usePrayer } from "../store/prayer";
import { useT } from "../lib/i18n";
// import { useLibrary } from "../store/library";

const ACCENT = "#417956";

export default function Prayer() {
  const { reminders, add, update, remove, } = usePrayer();
    // const { songs } = useLibrary();

    const t = useT();

    useAmbientAudio("https://zionsongs.netlify.app/assets/prayer-ambient.mp3", {
    volume: 0.9,   // tweak
    loop: true,
  });

  // Build localized labels using i18n
  const DOW = [
    { k: 0, label: t("dowSunShort") },
    { k: 1, label: t("dowMonShort") },
    { k: 2, label: t("dowTueShort") },
    { k: 3, label: t("dowWedShort") },
    { k: 4, label: t("dowThuShort") },
    { k: 5, label: t("dowFriShort") },
    { k: 6, label: t("dowSatShort") },
  ];

  const [time, setTime] = useState("06:30");
  const [days, setDays] = useState<number[]>([]);
  const [langPref, setLangPref] = useState<"auto" | "fr" | "en" | "ht">("auto");
  const [count, setCount] = useState<1 | 3>(1);

  // const preview = useMemo(
  //   () => suggestFor({ langPref, count }),
  //   [langPref, count, suggestFor]
  // );

  function toggleDay(k: number) {
    setDays((arr) =>
      arr.includes(k) ? arr.filter((d) => d !== k) : [...arr, k].sort()
    );
  }

  function addReminder() {
    add({ time, days, langPref, count, enabled: true });
    setTime("06:30"); setDays([]); setLangPref("auto"); setCount(1);
  }

  const hasAny = reminders.length > 0;

  return (
    <div className="safe-top px-4 pb-6" style={{ background:"#e2eee4", paddingBottom:"calc(64px + var(--safe-bottom,0px))" }}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-semibold" style={{ color:"#000" }}> {t("schedulePrayer")} </h1>
        <div className="text-xs text-black/60">{reminders.length} {t("reminder")}{reminders.length>1?"s":""}</div>
      </div>

      {!hasAny && (
        <p className="text-sm text-black/70 mb-3">{t("noPrayeryet")}</p>
      )}

      {hasAny && (
        <div className="space-y-2 mb-4">
          {reminders.map((r) => (
            <div key={r.id} className="rounded-xl border border-black/10 bg-white p-3 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color:"#000" }}>
                  {r.time} · {r.days.length ? r.days.map(d => DOW[d].label).join(", ") : t("allday")}
                </div>
                
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs flex items-center gap-1" style={{ color:"#000" }}>
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => update(r.id, { enabled: e.target.checked })}
                  />
                    {t("current")}
                </label>
                <button
                  onClick={() => remove(r.id)}
                  className="text-xs rounded border border-black/10 bg-white px-2 py-1"
                  style={{ color:"#000" }}
                >
                    {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new reminder */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs block mb-1" style={{ color:"#000" }}>{t("Hour")}</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded border border-black/10 px-2 py-1"
            />
          </div>
          {/* <div>
            <label className="text-xs block mb-1" style={{ color:"#000" }}> {t("langofSongSuggestion")} </label>
            <select
              value={langPref}
              onChange={(e) => setLangPref(e.target.value as any)}
              className="w-full rounded border border-black/10 px-2 py-1"
            >
              <option value="auto">Auto</option>
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ht">HT</option>
            </select>
          </div> */}
        </div>

        <div className="mt-3">
          <div className="text-xs mb-1" style={{ color:"#000" }}> {t("day")} </div>
          <div className="flex flex-wrap gap-1.5">
            {DOW.map((d) => {
              const on = days.includes(d.k);
              return (
                <button
                  key={d.k}
                  onClick={() => toggleDay(d.k)}
                  className="px-2 py-1 text-xs rounded border"
                  style={{
                    background: on ? ACCENT : "#fff",
                    color: on ? "#fff" : "#000",
                    borderColor:"rgba(0,0,0,0.15)",
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-black/60 mt-1">{t("keepEmpty")}</div>
        </div>

        {/* <div className="mt-3 flex items-center gap-3">
          <label className="text-xs" style={{ color:"#000" }}>Nombre de suggestions</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value) as 1 | 3)}
            className="rounded border border-black/10 px-2 py-1"
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
          </select>
        </div> */}

        {/* Aperçu */}
        {/* <div className="mt-4">
          <div className="text-xs font-medium mb-1" style={{ color:"#000" }}>{t("previewSugestion")}</div>
          {preview.length === 0 ? (
            <div className="text-xs text-black/60"> {t("noSongAvailable")} </div>
          ) : (
            <ul className="list-disc pl-5 text-sm" style={{ color:"#000" }}>
              {preview.map((s) => (
                <li key={s.id}>
                  {pickTitle(s, {
                    prefer: langPref === "auto" ? undefined : (langPref as LangCode),
                    fallbacks: s.hasLanguages as LangCode[],
                  })}
                </li>
              ))}
            </ul>
          )}
        </div> */}

        <div className="mt-4">
          <button
            onClick={addReminder}
            className="rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm"
            style={{ color:"#000" }}
          >
            {t("addReminder")}
          </button>
        </div>
      </div>
    </div>
  );
}
