import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAmbientAudio } from "../hooks/useAmbientAudio";
import { useSettings } from "../store/settings";
import { pickPrayerMessage } from "../data/prayerMessages";

/**
 * This page is not linked in the UI.
 * It is opened by tapping the local notification.
 * Expects optional query ?msg=... (URI-encoded)
 *
 * Make sure you place your SVG at: public/assets/prayertime.svg
 * And set PRAYER_AUDIO_URL to your ambient file (remote URL recommended).
 */
const PRAYER_AUDIO_URL = "https://zionsongs.netlify.app/assets/prayer-ambient.mp3";

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export default function PrayerNow() {
  const { settings } = useSettings();
  const q = useQuery();

  // Prefer the message passed by the notification; else generate one
  const message = useMemo(() => {
    const raw = q.get("msg");
    if (raw && raw.trim()) {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw; // already plain
      }
    }
    return pickPrayerMessage(settings.uiLanguage, Date.now());
  }, [q, settings.uiLanguage]);

  // Ambient audio (auto-play while this page is visible)
  useAmbientAudio(PRAYER_AUDIO_URL, { volume: 0.9, loop: true });

  return (
    <div
      className="safe-top min-h-screen flex items-center justify-center px-6 text-center"
      style={{ background: "#e2eee4" }}
    >
      <div className="max-w-xl w-full">
        <img
          src="/assets/prayertime.svg"
          alt=""
          className="mx-auto mb-6 w-32 h-32 object-contain opacity-90"
        />
        <h1 className="text-xl font-semibold mb-2" style={{ color: "#000" }}>
          {settings.uiLanguage === "en" ? "Time to pray" : "Moment de prière"}
        </h1>
        <p className="text-base leading-relaxed" style={{ color: "#000" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
