import { useCallback } from "react";
import { X } from "lucide-react";
import { useEventBanner } from "../store/banner";

type Props = {
  url: string;
};

// Try Capacitor Browser when available, else fallback
async function openExternal(url: string) {
  try {
    const mod: any = await import("@capacitor/browser");
    if (mod?.Browser?.open) {
      await mod.Browser.open({ url });
      return;
    }
  } catch {}
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function EventBanner({ url }: Props) {
  const { banner, visible, close } = useEventBanner(url);
  const onClick = useCallback(() => {
    if (banner?.link) openExternal(banner.link);
  }, [banner?.link]);

  if (!visible || !banner) return null;

  // Position above bottom nav (64px) + safe area + small gap
  const bottom = "calc(64px + var(--safe-bottom, 0px) + 12px)";

  return (
    <div
      className="fixed left-0 right-0 z-[60] px-4"
      style={{ bottom, pointerEvents: "none" }} // only card is clickable
      aria-live="polite"
    >
      <div
        className="mx-auto max-w-lg rounded-2xl border border-black/10 bg-white/90 backdrop-blur shadow-lg"
        style={{ pointerEvents: "auto", color: "#000" }}
        role="region"
        aria-label="Annonce d’événement"
      >
        <button
          onClick={close}
          aria-label="Fermer l’annonce"
          className="absolute right-2 top-2 rounded p-1 hover:bg-black/5"
          style={{ lineHeight: 0 }}
        >
          <X size={18} style={{ color: "#000" }} />
        </button>

        <button
          onClick={onClick}
          className="block w-full text-left px-4 py-3"
          style={{ cursor: banner.link ? "pointer" : "default" }}
          aria-label={banner.link ? "Ouvrir le détail de l’événement" : undefined}
        >
          <div className="text-sm font-semibold">{banner.title}</div>
          {banner.message && (
            <div className="mt-0.5 text-sm text-black/70">{banner.message}</div>
          )}
        </button>
      </div>
    </div>
  );
}
