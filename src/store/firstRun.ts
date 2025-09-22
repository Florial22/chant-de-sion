// src/store/firstRun.ts
import { useCallback, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage";

const KEY = "cds:onboarded:v1";

export function useFirstRun() {
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return !!readJSON<boolean>(KEY, false);
  });

  const markOnboarded = useCallback(() => {
    writeJSON(KEY, true);
    setOnboarded(true);
  }, []);

  return { onboarded, markOnboarded };
}
