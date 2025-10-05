import { NavLink } from "react-router-dom";
import { Home, Compass, Heart, Settings as SettingsIcon, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useT } from "../lib/i18n";

const ACCENT = "#417956";

function Item({
  to, label, icon: Icon,
}: { to: string; label: string; icon: LucideIcon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        ["flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition", isActive ? "" : "hover:bg-black/5"].join(" ")
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={2} color={isActive ? ACCENT : "#000"} />
          <span className="text-[11px] leading-none" style={{ color: isActive ? ACCENT : "#000" }}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const t = useT();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50" style={{ paddingBottom: "var(--safe-bottom)" }} aria-label="Navigation principale">
      <div className="mx-auto max-w-3xl">
        <div className="mx-3 mb-3 grid grid-cols-5 rounded-2xl border bg-white shadow-sm" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <Item to="/"         label={t("home")}      icon={Home} />
          <Item to="/explorer" label={t("explore")}   icon={Compass} />
          <Item to="/live"     label={t("channels")}  icon={Tv} />
          <Item to="/favoris"  label={t("favorites")} icon={Heart} />
          <Item to="/reglages" label={t("settings")}  icon={SettingsIcon} />
        </div>
      </div>
    </nav>
  );
}
