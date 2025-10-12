export const PRAYER_MESSAGES = {
  fr: [
    "Il est temps de prier — remercions Dieu pour sa fidélité.",
    "Un moment de prière — confie-Lui ta journée.",
    "Pause prière — ouvre ton cœur, Il écoute.",
    "Souviens-toi : Sa grâce te suffit aujourd’hui.",
    "Cherchons sa présence avec reconnaissance.",
    "Quelques minutes pour louer et remettre tes fardeaux.",
    "Dieu est proche de ceux qui L’invoquent.",
    "Repose-toi en Lui — parle-Lui simplement.",
    "Il renouvelle tes forces quand tu pries.",
    "Approche avec confiance — Il t’aime.",
    "Rends grâce pour ce qu’Il a déjà fait.",
    "Invite la paix de Dieu dans ce moment.",
    "Présente-Lui tes projets et tes peurs.",
    "Loue-Le pour sa bonté qui dure toujours.",
    "Mets ton espoir en Lui — Il est fidèle."
  ],
  en: [
    "It’s prayer time — thank God for His faithfulness.",
    "Take a prayer pause — entrust your day to Him.",
    "A moment to pray — open your heart, He hears you.",
    "Remember: His grace is enough today.",
    "Seek His presence with thanksgiving.",
    "A few minutes to praise and lay down your burdens.",
    "God is near to all who call on Him.",
    "Rest in Him — speak to Him simply.",
    "He renews your strength when you pray.",
    "Draw near with confidence — He loves you.",
    "Give thanks for what He’s already done.",
    "Invite God’s peace into this moment.",
    "Bring Him your plans and your fears.",
    "Praise Him for His goodness that endures forever.",
    "Place your hope in Him — He is faithful."
  ],
};

export type UiLang = "fr" | "en";

export function pickPrayerMessage(lang: UiLang, seed?: number): string {
  const list = PRAYER_MESSAGES[lang] ?? PRAYER_MESSAGES.fr;
  if (!list.length) return "";
  if (typeof seed === "number") {
    // deterministic pick with a tiny LCG
    let x = (seed >>> 0) || 1;
    x = (1103515245 * x + 12345) >>> 0;
    return list[x % list.length];
  }
  return list[Math.floor(Math.random() * list.length)];
}
