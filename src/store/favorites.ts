import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage";

const KEY = "cds:favorites:v1";

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(() => readJSON<string[]>(KEY, []));

  useEffect(() => {
    writeJSON(KEY, ids);
  }, [ids]);

  const isFav = (id: string) => ids.includes(id);
  const add = (id: string) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const remove = (id: string) => setIds((prev) => prev.filter((x) => x !== id));
  const toggle = (id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return { ids, isFav, add, remove, toggle };
}
