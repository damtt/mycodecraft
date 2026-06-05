const VERSION = 1;

export function saveData(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify({ version: VERSION, data }));
}

export function loadData<T>(key: string, validate: (v: unknown) => v is T): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      (parsed as { version?: unknown }).version !== VERSION
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
