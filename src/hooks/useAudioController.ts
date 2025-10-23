import { useEffect, useRef, useState } from "react";

const DEFAULT_ARTWORK = "/media/melody-artwork.png";

function applyMediaSession(a: HTMLAudioElement, title: string, artworkUrl = DEFAULT_ARTWORK) {
  const ms = (navigator as any).mediaSession;
  const MediaMetadataCtor = (window as any).MediaMetadata;
  if (!ms || !MediaMetadataCtor) return;

  try {
    ms.metadata = new MediaMetadataCtor({
      title,
      artist: "Chant de Sion",
      album: "Melody",
      artwork: [
        { src: artworkUrl, sizes: "96x96", type: "image/png" },
        { src: artworkUrl, sizes: "128x128", type: "image/png" },
        { src: artworkUrl, sizes: "192x192", type: "image/png" },
        { src: artworkUrl, sizes: "256x256", type: "image/png" },
        { src: artworkUrl, sizes: "384x384", type: "image/png" },
        { src: artworkUrl, sizes: "512x512", type: "image/png" },
      ],
    });

    // Wire native controls to this specific audio element instance
    ms.setActionHandler?.("play", () => {
      try { a.play(); } catch {}
    });
    ms.setActionHandler?.("pause", () => {
      try { a.pause(); } catch {}
    });
    ms.setActionHandler?.("previoustrack", null);
    ms.setActionHandler?.("nexttrack", null);
    ms.setActionHandler?.("seekto", (details: any) => {
      if (typeof details?.seekTime === "number") {
        a.currentTime = details.seekTime;
      }
    });
  } catch {
    // ignore subtle iOS/WebKit quirks
  }
}

export function useAudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    // iOS inline hint:
    (a as any).playsInline = true;

    a.addEventListener("play", () => setIsPlaying(true));
    a.addEventListener("pause", () => setIsPlaying(false));
    a.addEventListener("ended", () => setIsPlaying(false));

    audioRef.current = a;
    return () => {
      try { a.pause(); } catch {}
      audioRef.current = null;
    };
  }, []);

  async function play(id: string, url: string, opts?: { title?: string; artworkUrl?: string }) {
    const a = audioRef.current;
    if (!a) return;

    // Toggle if same item
    if (currentId === id) {
      if (a.paused) {
        try { await a.play(); } catch {}
      } else {
        try { a.pause(); } catch {}
      }
      return;
    }

    // Switch track
    try { a.pause(); } catch {}
    a.src = url;
    setCurrentId(id);

    // Set lock-screen / Control Center metadata
    applyMediaSession(a, opts?.title ?? "Melody", opts?.artworkUrl ?? DEFAULT_ARTWORK);

    try { await a.play(); } catch {}
  }

  function pause() {
    const a = audioRef.current;
    if (!a) return;
    try { a.pause(); } catch {}
  }

  return { currentId, isPlaying, play, pause };
}
