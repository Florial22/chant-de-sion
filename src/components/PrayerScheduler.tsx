import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { usePrayer } from "../store/prayer";
import { clearAllPrayerNotifications, schedulePrayerNotifications } from "../lib/prayerSchedule";

export default function PrayerScheduler() {
  const { reminders } = usePrayer();

  useEffect(() => {
    if (!Capacitor?.isNativePlatform?.()) return;
    let cancelled = false;

    (async () => {
      try {
        // clear then schedule; keeps things in sync without duplicates
        await clearAllPrayerNotifications(reminders);
        if (!cancelled) await schedulePrayerNotifications(reminders);
      } catch (e) {
        console.warn("[prayer] scheduling failed:", e);
      }
    })();

    return () => { cancelled = true; };
  }, [reminders]);

  return null;
}
