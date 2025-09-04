import { useSearch } from "../store/search";
import { Search as SearchIcon } from "lucide-react";

export default function SearchBar() {
  const { query, setQuery } = useSearch();

  return (
    <div className="relative">
      {/* Magnifying glass */}
      <SearchIcon
        width={18}
        height={18}
        strokeWidth={2}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2"
        color="rgba(0,0,0,0.5)"
      />

      {/* Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par titre ou paroles…"
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 pl-9 text-sm text-black placeholder-black/50 shadow-sm focus:outline-none"
        aria-label="Recherche"
      />
    </div>
  );
}
