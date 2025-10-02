import { useEffect, useState } from "react";

const BANNER_PUBLIC_URL = "https://zionsongs.netlify.app/banner.json";
// Replace with your function URL
const UPDATE_URL = "https://admin-zion.netlify.app/.netlify/functions/update-banner";

type Banner = {
  id: string;
  active?: boolean;
  title: string;
  message?: string;
  start?: string;
  end?: string;
  location?: string;
  link?: string;
  autocloseSec?: number;
};

export default function AdminBanner() {
  const [pwd, setPwd] = useState(sessionStorage.getItem("cds:admin:pwd") || "");
  const [form, setForm] = useState<Banner>({
    id: "",
    active: true,
    title: "",
    message: "",
    start: "",
    end: "",
    location: "",
    link: "",
    autocloseSec: 10
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BANNER_PUBLIC_URL}?t=${Date.now()}`);
        const json = await res.json();
        setForm({
          id: json.id || "",
          active: json.active !== false,
          title: json.title || "",
          message: json.message || "",
          start: json.start || "",
          end: json.end || "",
          location: json.location || "",
          link: json.link || "",
          autocloseSec: typeof json.autocloseSec === "number" ? json.autocloseSec : 10
        });
      } catch (e) {
        setMsg("Impossible de charger le banner.json");
      }
    })();
  }, []);

  function update<K extends keyof Banner>(k: K, v: Banner[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setMsg(null);
    if (!pwd) { setMsg("Entrez le mot de passe admin"); return; }
    if (!form.id || !form.title) { setMsg("ID et Titre sont requis"); return; }

    setLoading(true);
    try {
      sessionStorage.setItem("cds:admin:pwd", pwd);
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${pwd}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      // const out = await res.json();
      setMsg("✅ Enregistré. Le site Netlify va se mettre à jour.");
    } catch (e: any) {
      setMsg("❌ Échec: " + (e?.message || "inconnu"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="safe-top min-h-screen px-4 py-4" style={{ background: "#e2eee4" }}>
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-black/10 p-4 shadow-sm">
        <h1 className="text-lg font-semibold mb-3">Admin – Bannière</h1>

        <div className="mb-3">
          <label className="block text-sm mb-1">Mot de passe admin</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm mb-1">ID</label>
            <input className="w-full rounded border px-3 py-2" value={form.id} onChange={(e)=>update("id", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Titre</label>
            <input className="w-full rounded border px-3 py-2" value={form.title} onChange={(e)=>update("title", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea className="w-full rounded border px-3 py-2" rows={3} value={form.message} onChange={(e)=>update("message", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Start (ISO)</label>
              <input className="w-full rounded border px-3 py-2" placeholder="2025-10-03T23:00:00Z" value={form.start || ""} onChange={(e)=>update("start", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">End (ISO)</label>
              <input className="w-full rounded border px-3 py-2" placeholder="2025-10-04T02:00:00Z" value={form.end || ""} onChange={(e)=>update("end", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Lieu</label>
            <input className="w-full rounded border px-3 py-2" value={form.location || ""} onChange={(e)=>update("location", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Lien</label>
            <input className="w-full rounded border px-3 py-2" value={form.link || ""} onChange={(e)=>update("link", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Auto-fermeture (sec)</label>
            <input type="number" min={1} className="w-full rounded border px-3 py-2" value={form.autocloseSec || 10} onChange={(e)=>update("autocloseSec", Number(e.target.value)||10)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" checked={form.active !== false} onChange={(e)=>update("active", e.target.checked)} />
            <label htmlFor="active">Actif</label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={save}
            disabled={loading}
            className="rounded px-4 py-2 border shadow-sm"
            style={{ background: "#67C090", color: "#fff", borderColor: "transparent" }}
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
          {msg && <div className="text-sm">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
