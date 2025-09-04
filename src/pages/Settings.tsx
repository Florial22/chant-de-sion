import { useSettings } from "../store/settings";

export default function Settings() {
  const { settings, setPreferredLanguage, setDefaultFontSize, clearLyricsZoom } = useSettings();

  return (
    <div className="safe-top px-4 py-4">
      <h1 className="text-lg font-semibold mb-4" style={{ color:"#000" }}>Réglages</h1>

      {/* Preferred content language */}
      <section className="mb-6">
        <h2 className="text-sm font-medium mb-2" style={{ color:"#000" }}>Langue préférée (contenu)</h2>
        <div className="flex flex-wrap gap-2">
          {(["auto","fr","en","ht"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setPreferredLanguage(opt)}
              className="px-3 py-1.5 text-xs rounded-full border"
              style={{
                background: settings.preferredLanguage === opt ? "#417956" : "#fff",
                color: settings.preferredLanguage === opt ? "#fff" : "#000",
                borderColor: "rgba(0,0,0,0.15)",
              }}
            >
              {opt === "auto" ? "Auto" : opt.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-black/60">
          Utilisée comme valeur par défaut pour la recherche et l’ouverture des paroles.
        </p>
      </section>

      {/* Default font size */}
      <section className="mb-6">
        <h2 className="text-sm font-medium mb-2" style={{ color:"#000" }}>Taille du texte par défaut (lecture)</h2>
        <div className="flex items-center gap-3">
          <input
            type="range" min={16} max={36} step={2}
            value={settings.defaultFontSize}
            onChange={(e) => setDefaultFontSize(Number(e.target.value))}
            className="w-64"
          />
          <span className="text-sm" style={{ color:"#000" }}>{settings.defaultFontSize}px</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={clearLyricsZoom}
            className="rounded border border-black/10 bg-white px-3 py-1.5 shadow-sm"
            style={{ color:"#000" }}
            title="La prochaine ouverture des paroles utilisera la taille par défaut"
          >
            Réinitialiser la lecture
          </button>
        </div>
        <p className="mt-1 text-xs text-black/60">
          La lecture mémorise la taille actuelle (A+/A−). Réinitialiser pour appliquer la valeur par défaut au prochain chant.
        </p>
      </section>
    </div>
  );
}
