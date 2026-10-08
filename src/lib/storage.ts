import { useEffect, useState } from "react";

const PREFIX = "sho-el-8ada:v2:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** useState that survives reloads. Storage failures (private mode, quota) are ignored. */
export function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* not fatal */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
