import { useSearch } from "../store/search";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import { useT } from "../lib/i18n";

export default function SearchBar() {
  const { query, setQuery } = useSearch();
  const t = useT();

  const clear = () => setQuery("");

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
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 pl-9 pr-9 text-sm text-black placeholder-black/50 shadow-sm focus:outline-none no-native-clear"
        style={{ fontSize: 16 }}           // iOS won’t auto-zoom
        aria-label={t("searchAriaLabel") || "Recherche"}
        type="search"
        inputMode="search"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />

      {/* Clear (X) — appears only when there is text */}
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-black/5"
          aria-label={t("clearSearch") || "Effacer la recherche"}
          title={t("clearSearch") || "Effacer la recherche"}
        >
          <XIcon width={16} height={16} strokeWidth={2} color="#000" />
        </button>
      )}
    </div>
  );
}
