import { useState } from 'react';
import type { Lang } from '../lib/types';
import { useSettings } from '../stores/settingsStore';
import { useProfiles } from '../stores/profileStore';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';
import HoldToConfirm from '../components/HoldToConfirm';

const LANGS: Array<{ value: Lang; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
];

export default function SettingsScreen() {
  const { lang, soundOn, setLang, toggleSound } = useSettings();
  const resetActive = useProfiles((s) => s.resetActive);
  const { t } = useT();
  const [resetDone, setResetDone] = useState(false);

  return (
    <div data-testid="settings-screen" className="bg-world min-h-full p-6">
      <Panel className="mx-auto flex max-w-md flex-col gap-5">
        <h1 className="font-pixel text-sm text-grass-dark">⚙️ {t('settings')}</h1>

        <fieldset>
          <legend className="font-body font-black">🌐 {t('language')}</legend>
          <div className="mt-2 flex gap-4">
            {LANGS.map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-1 font-body font-bold">
                <input
                  type="radio"
                  name="lang"
                  checked={lang === value}
                  onChange={() => setLang(value)}
                  aria-label={label}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-2 font-body font-black">
          <input type="checkbox" checked={soundOn} onChange={toggleSound} aria-label={t('sound')} />
          🔊 {t('sound')}: {soundOn ? t('on') : t('off')}
        </label>

        <div>
          <p className="mb-2 font-body font-black text-red-700">⚠️ {t('resetProgress')}</p>
          <HoldToConfirm
            label={t('holdToReset')}
            holdMs={2000}
            onConfirm={() => { resetActive(); setResetDone(true); }}
          />
          {resetDone && <p className="mt-2 font-body font-bold">{t('resetDone')}</p>}
        </div>
      </Panel>
    </div>
  );
}
