import { useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { usePrayer } from "../store/prayer";
import { useLibrary } from "../store/library";
import { useNavigate } from "react-router-dom";
import { pickPrayerMessage } from "../data/prayerMessages";
import { useSettings } from "../store/settings";

export default function NotificationBridge() {
  const navigate = useNavigate();
  const { suggestFor } = usePrayer();
  const { songs } = useLibrary();
  const { settings } = useSettings();

  useEffect(() => {
    if (!Capacitor?.isNativePlatform?.()) return;

    let handle: PluginListenerHandle | undefined;

    (async () => {
      try {
        handle = await LocalNotifications.addListener(
          "localNotificationActionPerformed",
          async (e) => {
            try {
              const extra = (e?.notification as any)?.extra || {};
              if (extra?.kind !== "cds-prayer") return;

              // Preferred: open the hidden "Prayer Now" page with the message
              if (extra.view === "prayer-now") {
                const msg =
                  extra.msg || pickPrayerMessage(settings.uiLanguage, Date.now());
                const url = `/priere/maintenant?msg=${encodeURIComponent(msg)}`;
                navigate(url, { replace: true });
                return;
              }

              // Fallback: just open the Prayer management page
              navigate("/priere", { replace: true });
            } catch (err) {
              console.warn("Notification tap handling failed:", err);
            }
          }
        );
      } catch (err) {
        console.warn("addListener failed", err);
      }
    })();

    return () => {
      try {
        handle?.remove();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestFor, songs, settings.uiLanguage]);

  return null;
}
