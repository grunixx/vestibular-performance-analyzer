const PREFIX = "simulai-mvp";

function key(name: string): string {
  return `${PREFIX}:${name}`;
}

export function readLocalStorage<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key(name));
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // no-op
  }
}

export function removeLocalStorage(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(name));
}
