import { useState } from 'react';
import type { Lang } from '../lib/types';
import { useSettings, type FontScale } from '../stores/settingsStore';
import { useProfiles } from '../stores/profileStore';
import { useT } from '../lib/i18n';
import { playSound } from '../features/audio/sounds';
import Panel from '../components/Panel';
import PixelButton from '../components/PixelButton';
import HoldToConfirm from '../components/HoldToConfirm';
import Icon from '../components/Icon';
import SocialLinks from '../components/SocialLinks';

const LANGS: Array<{ value: Lang; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
];

const FONT_SIZES: Array<{ value: FontScale; key: 'fontSmall' | 'fontMedium' | 'fontLarge' }> = [
  { value: 'sm', key: 'fontSmall' },
  { value: 'md', key: 'fontMedium' },
  { value: 'lg', key: 'fontLarge' },
];

export default function SettingsScreen() {
  const { lang, soundOn, fontScale, guideOn, setLang, toggleSound, setFontScale, toggleGuide } = useSettings();
  const resetActive = useProfiles((s) => s.resetActive);
  const { t } = useT();
  const [resetDone, setResetDone] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div data-testid="settings-screen" className="bg-world min-h-full flex-1 p-6">
      <Panel className="mx-auto flex max-w-md flex-col gap-5">
        <h1 className="font-pixel text-sm text-grass-dark"><Icon name="gear" /> {t('settings')}</h1>

        <fieldset>
          <legend className="font-body font-black"><Icon name="globe" /> {t('language')}</legend>
          <div className="mt-2 flex gap-4">
            {LANGS.map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-1 font-body font-bold">
                <input
                  type="radio"
                  name="lang"
                  checked={lang === value}
                  onChange={() => { playSound('click'); setLang(value); }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-body font-black"><Icon name="letters" /> {t('fontSize')}</legend>
          <div className="mt-2 flex gap-4">
            {FONT_SIZES.map(({ value, key }) => (
              <label key={value} className="flex cursor-pointer items-center gap-1 font-body font-bold">
                <input
                  type="radio"
                  name="fontScale"
                  checked={fontScale === value}
                  onChange={() => { playSound('click'); setFontScale(value); }}
                />
                {t(key)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-2 font-body font-black">
          <input
            type="checkbox"
            checked={soundOn}
            onChange={() => { playSound('click'); toggleSound(); }}
          />
          <Icon name="volume" /> {t('sound')}: {soundOn ? t('on') : t('off')}
        </label>

        <label className="flex cursor-pointer items-center gap-2 font-body font-black">
          <input
            type="checkbox"
            checked={guideOn}
            onChange={() => { playSound('click'); toggleGuide(); }}
          />
          <Icon name="owl" /> {t('guideBuddy')}: {guideOn ? t('on') : t('off')}
        </label>

        <div>
          <p className="mb-2 font-body font-black text-red-700"><Icon name="warning" /> {t('resetProgress')}</p>
          {!confirmReset ? (
            <PixelButton variant="danger" onClick={() => { setConfirmReset(true); setResetDone(false); }}>
              {t('resetProgress')}
            </PixelButton>
          ) : (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t('resetProgress')}
              className="rounded-md border-2 border-red-400 bg-red-50 p-3"
            >
              <p className="mb-3 font-body font-bold text-red-700">{t('resetConfirm')}</p>
              <div className="flex gap-2">
                <HoldToConfirm
                  label={t('holdToReset')}
                  holdMs={1500}
                  onConfirm={() => { resetActive(); setResetDone(true); setConfirmReset(false); }}
                />
                <PixelButton variant="stone" onClick={() => setConfirmReset(false)}>{t('cancel')}</PixelButton>
              </div>
            </div>
          )}
          {resetDone && <p className="mt-2 font-body font-bold">{t('resetDone')}</p>}
        </div>

        <div className="border-t-2 border-stone-200 pt-4">
          <p className="mb-2 font-body font-black"><Icon name="sign" /> {t('about')}</p>
          <SocialLinks className="font-body text-sm font-bold text-stone-600" />
        </div>
      </Panel>
    </div>
  );
}
