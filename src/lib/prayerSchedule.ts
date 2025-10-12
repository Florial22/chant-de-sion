import type { PrayerReminder } from "../store/prayer";
import { LocalNotifications } from "@capacitor/local-notifications";
import { pickPrayerMessage } from "../data/prayerMessages";

/* ----------------------------- ID generation ----------------------------- */

function makeNotiIds(rem: PrayerReminder): number[] {
  const days = rem.days.length ? rem.days : [0, 1, 2, 3, 4, 5, 6]; // 0=Sun..6=Sat
  return days.map((d) => {
    const base = Math.abs(hashCode(rem.id + ":" + d));
    return base % 2147480000;
  });
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/* ----------------------------- Settings helpers ----------------------------- */

const SETTINGS_KEY = "cds:settings:v1";
type UiLanguage = "fr" | "en";

function readUiLanguage(): UiLanguage {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const obj = raw ? JSON.parse(raw) : null;
    const ui = obj?.uiLanguage;
    return ui === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

/* ----------------------------- Permission helpers ----------------------------- */

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const p = await LocalNotifications.checkPermissions();
    if (p.display === "granted") return true;
    const r = await LocalNotifications.requestPermissions();
    return r.display === "granted";
  } catch {
    return false;
  }
}

/* ----------------------------- Legacy clear (by current reminders) ----------------------------- */

export async function clearAllPrayerNotifications(reminders: PrayerReminder[]) {
  try {
    const ids = reminders.flatMap((r) => makeNotiIds(r));
    if (ids.length) {
      await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
    }
  } catch {}
}

/* ----------------------------- New: registry of scheduled IDs ----------------------------- */

const SCHED_KEY = "cds:prayer:scheduledIds";

function readScheduledIdSet(): Set<number> {
  try {
    const raw = localStorage.getItem(SCHED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeScheduledIds(ids: number[]) {
  try {
    localStorage.setItem(SCHED_KEY, JSON.stringify(ids));
  } catch {}
}

/* ----------------------------- Main scheduler ----------------------------- */

export async function schedulePrayerNotifications(reminders: PrayerReminder[]) {
  const uiLang = readUiLanguage();

  // 0) If nothing enabled: cancel any previously scheduled IDs and clear registry.
  const enabled = reminders.filter((r) => r.enabled);
  if (enabled.length === 0) {
    const prev = readScheduledIdSet();
    if (prev.size > 0) {
      try {
        await LocalNotifications.cancel({
          notifications: Array.from(prev).map((id) => ({ id })),
        });
      } catch {}
      writeScheduledIds([]);
    }
    return;
  }

  // 1) Permissions
  const allowed = await ensureNotificationPermission();
  if (!allowed) return;

  // 2) Always cancel any previously scheduled IDs from our registry (prevents orphans)
  const prev = readScheduledIdSet();
  if (prev.size > 0) {
    try {
      await LocalNotifications.cancel({
        notifications: Array.from(prev).map((id) => ({ id })),
      });
    } catch {}
  }

  // 3) Build the new schedule set
  const toSchedule: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { on: { weekday: number; hour: number; minute: number } };
    extra: any;
  }> = [];

  for (const r of enabled) {
    const [hh, mm] = (r.time || "06:30")
      .split(":")
      .map((x) => Math.max(0, Math.min(59, Number(x))));

    const days = r.days.length ? r.days : [0, 1, 2, 3, 4, 5, 6]; // 0=Sun..6=Sat
    const ids = makeNotiIds(r);

    days.forEach((d, i) => {
      // ✅ Capacitor expects 1..7 with 1 = Sunday
      const weekday = d + 1;

      const msg = pickPrayerMessage(uiLang, Date.now());

      toSchedule.push({
        id: ids[i],
        title: "Chant de Sion",
        body: msg,
        schedule: { on: { weekday, hour: hh, minute: mm } },
        extra: {
          kind: "cds-prayer",
          view: "prayer-now",
          msg,
          reminderId: r.id,
          langPref: r.langPref,
          count: r.count,
        },
      });
    });
  }

  // 4) Submit to OS
  await LocalNotifications.schedule({
    notifications: toSchedule.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      schedule: n.schedule,
      sound: "default",
      channelId: "prayer_reminders",
      extra: n.extra,
      smallIcon: "ic_stat_icon_config_default",
    })),
  });

  // 5) Save the newly scheduled IDs so we can cancel them next time
  writeScheduledIds(toSchedule.map((n) => n.id));
}

/* ----------------------------- Optional: full reset helper ----------------------------- */

export async function resetAllPrayerNotifications() {
  try {
    // 1) Cancel all pending (scheduled) notifications
    const pending = await LocalNotifications.getPending();
    if (pending?.notifications?.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    // 2) Clear delivered notifications (best effort; not all platforms show banners again)
    try {
      // Capacitor v5+
      await (LocalNotifications as any).removeAllDeliveredNotifications?.();
    } catch {
      /* ignore if not supported */
    }
  } catch (e) {
    // swallow — reset is best-effort
    console.warn("[prayer] resetAllPrayerNotifications failed:", e);
  }

  // 3) Clear our local registry of scheduled IDs
  try {
    localStorage.setItem("cds:prayer:scheduledIds", JSON.stringify([]));
  } catch {}
}
