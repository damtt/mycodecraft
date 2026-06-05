import type { Lang, Localized } from './types';
import { UI, type UIKey } from '../content/i18n/ui';
import { useSettings } from '../stores/settingsStore';

/** Pure lookup with EN fallback for blank translations. */
export function lt(l: Localized, lang: Lang): string {
  return (lang === 'vi' && l.vi) || l.en;
}

/** Hook: t('key') for UI strings, tl(localized) for content strings. */
export function useT() {
  const lang = useSettings((s) => s.lang);
  return {
    lang,
    t: (key: UIKey) => lt(UI[key], lang),
    tl: (l: Localized) => lt(l, lang),
  };
}
