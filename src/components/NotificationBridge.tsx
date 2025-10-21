import { useEffect, useRef } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { pickPrayerMessage } from "../data/prayerMessages";
import { useSettings } from "../store/settings";

export default function NotificationBridge() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const processed = useRef<Set<number>>(new Set()); // avoid handling same id twice

  useEffect(() => {
    if (!Capacitor?.isNativePlatform?.()) return;

    let handle: PluginListenerHandle | undefined;
    let mounted = true;

    (async () => {
      // 1) Live tap handling (foreground/background)
      try {
        handle = await LocalNotifications.addListener(
          "localNotificationActionPerformed",
          (e) => {
            try {
              const id = (e?.notification as any)?.id as number | undefined;
              if (id && processed.current.has(id)) return; // already handled
              if (id) processed.current.add(id);

              const extra = (e?.notification as any)?.extra || {};
              if (extra?.kind !== "cds-prayer") return;

              if (extra.view === "prayer-now") {
                const msg = extra.msg || pickPrayerMessage(settings.uiLanguage, Date.now());
                navigate(`/priere/maintenant?msg=${encodeURIComponent(msg)}`, { replace: true });
              } else {
                navigate("/priere", { replace: true });
              }
            } catch (err) {
              console.warn("[NotificationBridge] tap handling failed:", err);
            }
          }
        );
      } catch (err) {
        console.warn("[NotificationBridge] addListener failed:", err);
      }

      // 2) Cold-start safety: inspect delivered notifications once
      try {
        // Not in the official TS types on all versions; guard via any + optional chain
        const delivered = await (LocalNotifications as any).getDeliveredNotifications?.();
        if (!mounted) return;
        const list: Array<{ id?: number; extra?: any }> = delivered?.notifications || [];

        // Pick the most recent cds-prayer notification
        const last = [...list].reverse().find((n) => (n as any)?.extra?.kind === "cds-prayer");
        if (last?.id && !processed.current.has(last.id)) {
          processed.current.add(last.id);
          const extra = (last as any).extra || {};
          if (extra.view === "prayer-now") {
            const msg = extra.msg || pickPrayerMessage(settings.uiLanguage, Date.now());
            navigate(`/priere/maintenant?msg=${encodeURIComponent(msg)}`, { replace: true });
          } else {
            navigate("/priere", { replace: true });
          }
        }
      } catch {
        // ignore if unsupported
      }
    })();

    return () => {
      mounted = false;
      try {
        handle?.remove?.();
      } catch {}
    };
  }, [navigate, settings.uiLanguage]);

  return null;
}
