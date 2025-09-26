import { useEffect, useMemo, useState } from "react";
import {fetchBanner, isActive } from "../lib/eventBanner";
import type { EventBannerData } from "../lib/eventBanner";

function sessionKey(id: string) {
  return `cds:banner:dismissed:${id}`;
}

export function useEventBanner(url: string) {
  const [data, setData] = useState<EventBannerData | null>(null);
  const [visible, setVisible] = useState(false);

  // fetch once on mount / when URL changes
  useEffect(() => {
    let alive = true;
    (async () => {
      const b = await fetchBanner(url);
      if (!alive) return;
      setData(b);
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  // compute visibility: active, not session-dismissed
  const dismissed = useMemo(
    () => (data?.id ? sessionStorage.getItem(sessionKey(data.id)) === "1" : false),
    [data?.id]
  );

  useEffect(() => {
    const ok = !!data && isActive(data) && !dismissed;
    setVisible(ok);
  }, [data, dismissed]);

  // autoclose timer
  useEffect(() => {
    if (!visible || !data) return;
    const sec = Math.max(1, data.autocloseSec ?? 10);
    const t = window.setTimeout(() => setVisible(false), sec * 1000);
    return () => window.clearTimeout(t);
  }, [visible, data]);

  function close() {
    if (data?.id) sessionStorage.setItem(sessionKey(data.id), "1");
    setVisible(false);
  }

  return { banner: data, visible, close };
}
