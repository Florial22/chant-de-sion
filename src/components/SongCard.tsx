import { Link } from "react-router-dom";
import type { Song, LangCode } from "../types/song";
import FavoriteButton from "./FavoriteButton";
import { pickTitle } from "../lib/pickTitle";
import { useSettings } from "../store/settings";

type Props = {
  song: Song;
  langPref?: LangCode | "any";
};

// function getTitle(song: Song): string {
//   return song.titles.fr || song.titles.en || song.titles.ht || "Sans titre";
// }

function firstChorusSnippet(song: Song, pref: LangCode | "any" = "any"): string {
  const stanza =
    song.stanzas.find((s) => s.kind === "chorus" && (pref === "any" || s.lang === pref)) ||
    song.stanzas.find((s) => s.kind === "verse" && (pref === "any" || s.lang === pref));

  if (!stanza) return "";
  const lines = stanza.text.split("\n").map((x) => x.trim()).filter(Boolean);
  return lines.slice(0, 2).join(" · ");
}



export default function SongCard({ song, langPref = "any" }: Props) {
  const { settings } = useSettings();

  // Prefer the explicit langPref if provided (e.g., from a context),
  // otherwise use the user's preferred content language from Settings.
  const preferLang =
    langPref !== "any"
      ? (langPref as LangCode)
      : settings.preferredLanguage !== "auto"
      ? (settings.preferredLanguage as LangCode)
      : undefined;

  const title = pickTitle(song, {
    prefer: preferLang,
    fallbacks: song.hasLanguages as LangCode[],
  });

  // Reuse the same preference for the snippet when possible
  const snippetPref: LangCode | "any" = preferLang ?? "any";
  const snippet = firstChorusSnippet(song, snippetPref);

  return (
    <div className="relative">
      <Link
        to={`/song/${song.id}`}
        className="block rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition"
      >
        <h3 className="font-semibold mb-1" style={{ color: "#000" }}>{title}</h3>
        <p className="text-sm text-black/70 line-clamp-2">{snippet}</p>
      </Link>

      <FavoriteButton songId={song.id} className="absolute top-3 right-3 z-10" />
    </div>
  );
}

