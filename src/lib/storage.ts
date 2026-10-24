// localStorage/sessionStorage can throw (private mode, quota, disabled); every
// access goes through these so the app degrades to in-memory state.

export function readJson<T>(storage: Storage | undefined, key: string, fallback: T): T {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(storage: Storage | undefined, key: string, value: unknown): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: storage unavailable
  }
}

export function removeKey(storage: Storage | undefined, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // ignore
  }
}

export function safeLocalStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function safeSessionStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : undefined;
  } catch {
    return undefined;
  }
}
