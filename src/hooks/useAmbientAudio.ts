import { useEffect, useRef } from "react";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";

type Opts = { volume?: number; loop?: boolean };
type AppState = { isActive: boolean };

export function useAmbientAudio(url: string, opts: Opts = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const gestureRetryBound = useRef(false);

  useEffect(() => {
    if (!url) return;

    const audio = new Audio(url);
    audio.loop = opts.loop ?? true;
    audio.volume = typeof opts.volume === "number" ? opts.volume : 1;
    audio.preload = "auto";
    audioRef.current = audio;

    const tryPlay = async () => {
      try {
        if (startedRef.current) return;
        await audio.play();
        startedRef.current = true;
      } catch {
        if (!gestureRetryBound.current) {
          const onFirstGesture = async () => {
            try {
              if (!startedRef.current) {
                await audio.play();
                startedRef.current = true;
              }
            } catch {}
            window.removeEventListener("click", onFirstGesture);
            window.removeEventListener("touchstart", onFirstGesture);
          };
          window.addEventListener("click", onFirstGesture, { once: true });
          window.addEventListener("touchstart", onFirstGesture, { once: true });
          gestureRetryBound.current = true;
        }
      }
    };

    void tryPlay();

    const onVis = () => {
      if (document.visibilityState === "visible") void tryPlay();
      else {
        audio.pause();
        startedRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const onPageHide = () => {
      audio.pause();
      startedRef.current = false;
    };
    window.addEventListener("pagehide", onPageHide);

    // ---- Capacitor app state (fix: store the resolved handle)
    let appHandle: PluginListenerHandle | undefined;

    if (Capacitor?.isNativePlatform?.()) {
      (async () => {
        try {
          const { App } = await import("@capacitor/app");
          appHandle = await App.addListener(
            "appStateChange",
            (state: AppState) => {
              if (state.isActive) void tryPlay();
              else {
                audio.pause();
                startedRef.current = false;
              }
            }
          );
        } catch {
          // plugin missing or web — visibility handlers still cover us
        }
      })();
    }

    return () => {
      try { audio.pause(); } catch {}
      audio.src = "";
      audioRef.current = null;
      startedRef.current = false;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onPageHide);
      try { appHandle?.remove(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, opts.volume, opts.loop]);
}
