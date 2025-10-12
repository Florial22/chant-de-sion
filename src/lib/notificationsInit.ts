import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export async function initNotificationChannels() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // ANDROID: create a channel with sound "prayer" (see file placement below)
    await LocalNotifications.createChannel?.({
      id: "prayer_reminders",
      name: "Rappels de prière",
      description: "Notifications de rappel pour la prière",
      importance: 4, // HIGH
      lights: true,
      vibration: true,
    });
  } catch (e) {
    console.warn("createChannel failed", e);
  }
}
