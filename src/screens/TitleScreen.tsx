import { useNavigate } from 'react-router';
import { useSettings } from '../stores/settingsStore';
import { playSound } from '../features/audio/sounds';
import { useT } from '../lib/i18n';
import PixelButton from '../components/PixelButton';

export default function TitleScreen() {
  const navigate = useNavigate();
  const { lang, t } = useT();
  const setLang = useSettings((s) => s.setLang);

  return (
    <div data-testid="title-screen" className="bg-world relative flex min-h-screen flex-col items-center justify-center gap-8">
      <button
        data-testid="lang-toggle-title"
        aria-label={lang === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
        onClick={() => { playSound('click'); setLang(lang === 'en' ? 'vi' : 'en'); }}
        className="absolute right-4 top-4 cursor-pointer font-pixel p-2 text-xs text-white drop-shadow"
      >
        🌐 {lang.toUpperCase()}
      </button>
      <h1 className="font-pixel text-4xl text-white [text-shadow:4px_4px_0_#3d8527] sm:text-5xl">
        ⛏️ CodeCraft
      </h1>
      <p className="font-body text-xl font-bold text-night">{t('tagline')}</p>
      <PixelButton className="text-xl" onClick={() => navigate('/players')}>
        ▶ {t('pressStart')}
      </PixelButton>
    </div>
  );
}
