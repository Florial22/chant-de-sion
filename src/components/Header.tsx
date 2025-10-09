import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useT } from "../lib/i18n";

export default function Header() {
  const { pathname } = useLocation();
  const t = useT();
  // hide search on some pages
  const showSearch =
    pathname !== "/reglages" &&
    !pathname.startsWith("/explorer") &&
    !pathname.startsWith("/live") &&
    !pathname.startsWith("/favoris");

  return (
    <header
      className="safe-top sticky top-0 z-40 px-4 pt-2 pb-3 border-b"
      style={{ background: "#417956", borderColor: "rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center justify-center">
        <h1
          className="text-xl font-semibold tracking-wide"
          aria-label="Chant de Sion"
          style={{ color: "#e2eee4" }}
        >
          {t("appName")}
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
