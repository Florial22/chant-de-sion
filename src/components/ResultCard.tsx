import { Link } from "react-router-dom";
import type { SearchHit } from "../store/search";

export default function ResultCard({ hit }: { hit: SearchHit }) {
  const title = hit.song.titles.fr || hit.song.titles.en || hit.song.titles.ht || "Sans titre";
  return (
    <Link
      to={`/song/${hit.song.id}`}
      className="block rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition"
    >
      <h3 className="font-semibold mb-1" style={{ color: "#000" }}>{title}</h3>
      <p className="text-sm text-black/80 line-clamp-2">{hit.snippet}</p>
    </Link>
  );
}
