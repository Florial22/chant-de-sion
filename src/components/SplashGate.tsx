import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useLibrary } from "../store/library";
import { useT } from "../lib/i18n";

const ACCENT = "#417956";
const LIGHT = "#e2eee4";

/**
 * Shows a full-screen overlay while the app boots.
 * Native builds: Capacitor SplashScreen handles cold start;
 * this overlay still provides a tiny fade-in/fade-out feel on web/PWA.
 */
export default function SplashGate() {
  const { status } = useLibrary(); // waits for songs to load
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [hidden, setHidden] = useState(false);
    const t = useT();

  // small minimum so the splash doesn’t flash too quickly on fast reloads
  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 400);
    return () => clearTimeout(t);
  }, []);

  const ready = useMemo(
    () => status !== "loading" && minTimeDone,
    [status, minTimeDone]
  );

  useEffect(() => {
    if (ready) {
      // small fade-out delay to let the CSS transition play
      const t = setTimeout(() => setHidden(true), 250);
      return () => clearTimeout(t);
    }
  }, [ready]);

  // On native cold start, the Capacitor splash covers this anyway.
  // Still show on web/PWA.
  const isNative = Capacitor?.isNativePlatform?.() === true;

  if (hidden || isNative === true) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] grid place-items-center transition-opacity duration-300",
        ready ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
      style={{ background: ACCENT }}
      aria-hidden
    >
      <div className="text-center px-6">
        <div
          className="mx-auto mb-4 grid place-items-center rounded-2xl"
          style={{
            width: 96,
            height: 96,
            background: LIGHT,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          {/* Simple “CDS” monogram; replace with your logo if you want */}
          <span className="text-2xl font-bold" style={{ color: ACCENT }}>
            {t("appAcronym")}
          </span>
        </div>
        <h1
          className="text-xl font-semibold tracking-wide"
          style={{ color: "#fff" }}
        >
          {t("appName")}
        </h1>
      </div>
    </div>
  );
}
