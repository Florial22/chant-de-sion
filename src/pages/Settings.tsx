import { useSettings } from "../store/settings";
import { useT } from "../lib/i18n";

export default function Settings() {
  const {
    settings,
    setUiLanguage,
    setPreferredLanguage,
    setDefaultFontSize,
    clearLyricsZoom,
  } = useSettings();

  const t = useT();

  return (
    <div
      className="safe-top px-4 py-4"
      style={{
        background: "#e2eee4",
        paddingBottom: "calc(64px + var(--safe-bottom, 0px))", // pour ne pas passer sous la BottomNav
      }}
    >
      <h1 className="text-lg font-semibold mb-4" style={{ color: "#000" }}>
        {t("settings")}  
      </h1>

      {/* Langue de l'interface (UI) */}
      <section className="mb-6">
        <h2 className="text-sm font-medium mb-2" style={{ color: "#000" }}>
          {t("uiLanguageLabel")}
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ui-lang"
              value="fr"
              checked={settings.uiLanguage === "fr"}
              onChange={() => setUiLanguage("fr")}
            />
            Français
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ui-lang"
              value="en"
              checked={settings.uiLanguage === "en"}
              onChange={() => setUiLanguage("en")}
            />
            English
          </label>
        </div>
        <p className="mt-1 text-xs text-black/60">
          {t("uiLanguagelabel")}
        </p>
      </section>

      {/* Langue préférée du contenu (paroles) */}
      <section className="mb-6">
        <h2 className="text-sm font-medium mb-2" style={{ color: "#000" }}>
          {t("preferredLanguageContent")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(["auto", "fr", "en", "ht"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setPreferredLanguage(opt)}
              className="px-3 py-1.5 text-xs rounded-full border"
              style={{
                background:
                  settings.preferredLanguage === opt ? "#417956" : "#fff",
                color: settings.preferredLanguage === opt ? "#fff" : "#000",
                borderColor: "rgba(0,0,0,0.15)",
              }}
            >
              {opt === "auto" ? "Auto" : opt.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-black/60">
          {t("preferredLanguagelabel")}
        </p>
      </section>

      {/* Taille de texte par défaut (lecture) */}
      <section className="mb-6">
        <h2 className="text-sm font-medium mb-2" style={{ color: "#000" }}>
          {t("textsize")}
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={16}
            max={36}
            step={2}
            value={settings.defaultFontSize}
            onChange={(e) => setDefaultFontSize(Number(e.target.value))}
            className="w-64"
          />
          <span className="text-sm" style={{ color: "#000" }}>
            {settings.defaultFontSize}px
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={clearLyricsZoom}
            className="rounded border border-black/10 bg-white px-3 py-1.5 shadow-sm"
            style={{ color: "#000" }}
            title="La prochaine ouverture des paroles utilisera la taille par défaut"
          >
            {t("reinitialize")}
          </button>
        </div>
        {/* <p className="mt-1 text-xs text-black/60">
          La lecture mémorise la taille actuelle (A+/A−). Réinitialiser pour
          appliquer la valeur par défaut au prochain chant.
        </p> */}
      </section>

      {/* Version */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-sm text-black/60">{t("appversion")}</div>
        <div className="mt-1 font-medium" style={{ color: "#000" }}>
          v{__APP_VERSION__}
        </div>
      </div>
    </div>
  );
}
