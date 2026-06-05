export const STORAGE_VERSION = 1;

export function saveData(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }));
  } catch (err) {
    // Quota exceeded or storage unavailable — saves are <50KB so this is
    // exceptional; warn instead of crashing the caller (e.g., victory flow).
    console.warn('codecraft: failed to save', key, err);
  }
}

export function loadData<T>(key: string, validate: (v: unknown) => v is T): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      (parsed as { version?: unknown }).version !== STORAGE_VERSION
    ) {
      return null;
    }
    const data = (parsed as { data: unknown }).data;
    return validate(data) ? data : null;
  } catch {
    return null;
  }
}

export function removeData(key: string): void {
  localStorage.removeItem(key);
}
