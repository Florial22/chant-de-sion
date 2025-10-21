// src/components/BottomNav.tsx
import { NavLink } from "react-router-dom";
import { Home, Compass, Heart, Settings as SettingsIcon, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useT } from "../lib/i18n";

const ACCENT = "#417956";
const INACTIVE = "#0f172a"; // slate-900-ish
const BAR_MIN_HEIGHT_PX = 72; // keep the same visual height

async function hapticTap() {
  try {
    if (Capacitor?.isNativePlatform?.()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    /* noop */
  }
}

function Item({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={hapticTap}
      className={({ isActive }) =>
        [
          "flex items-center justify-center gap-2 px-4 py-3 rounded-md transition min-w-0",
          isActive ? "bg-transparent" : "hover:bg-black/5",
        ].join(" ")
      }
      aria-label={label}
    >
      {({ isActive }) => {
        const color = isActive ? ACCENT : INACTIVE;
        return (
          <>
            {/* Use currentColor via wrapper to avoid SVG prop quirks; pin size so it never morphs */}
            <span className="-translate-y-0.5 shrink-0" style={{ color }} aria-hidden="true">
              <Icon size={22} strokeWidth={2} className="w-[22px] h-[22px] block" />
            </span>
            {isActive && (
              <span className="text-[12px] leading-none font-medium" style={{ color }}>
                {label}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

export default function BottomNav() {
  const t = useT();

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-50"
      /* Flush to device edge; safe-area padding is inside the bar */
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Navigation principale"
    >
      {/* IMPORTANT: The painted/blurred layer is on this full-width element,
          not on any centered max-w container, so it truly reaches the bottom/edges. */}
      <div
        className={[
          "border-t bg-white/75 backdrop-blur-md backdrop-saturate-150",
          "shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.1)]",
          "flex items-center",
        ].join(" ")}
        style={{
          borderColor: "rgba(0,0,0,0.08)",
          minHeight: `${BAR_MIN_HEIGHT_PX}px`,
        }}
      >
        {/* Inner row may be centered/narrow; it no longer affects the bar’s painted area */}
        <div className="mx-auto w-full max-w-3xl">
          <div className="grid w-full grid-cols-5">
            <Item to="/"         label={t("home")}      icon={Home} />
            <Item to="/explorer" label={t("explore")}   icon={Compass} />
            <Item to="/live"     label={t("channels")}  icon={Tv} />
            <Item to="/favoris"  label={t("favorites")} icon={Heart} />
            <Item to="/reglages" label={t("settings")}  icon={SettingsIcon} />
          </div>
        </div>
      </div>
    </nav>
  );
}
