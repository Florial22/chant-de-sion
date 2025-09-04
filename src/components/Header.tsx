import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Header() {
  const { pathname } = useLocation();
  // Hide search on Settings and Explore pages (keep title)
  const showSearch = pathname !== "/reglages" && !pathname.startsWith("/explorer");

  return (
    <header
      className="safe-top sticky top-0 z-40 px-4 pt-2 pb-3 border-b"
      style={{ background: "#e2eee4", borderColor: "rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center justify-center">
        <h1
          className="text-xl font-semibold tracking-wide"
          aria-label="Chant de Sion"
          style={{ color: "#417956" }}
        >
          Chant de Sion
        </h1>
      </div>

      {showSearch && (
        <div className="mt-2">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
