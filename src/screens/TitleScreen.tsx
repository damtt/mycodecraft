import { useNavigate } from 'react-router';
import { useSettings } from '../stores/settingsStore';
import { playSound } from '../features/audio/sounds';
import { useT } from '../lib/i18n';
import PixelButton from '../components/PixelButton';
import Icon from '../components/Icon';

export default function TitleScreen() {
  const navigate = useNavigate();
  const { lang, t } = useT();
  const setLang = useSettings((s) => s.setLang);

  return (
    <div data-testid="title-screen" className="bg-world relative flex min-h-screen flex-col items-center justify-center gap-10 pb-[40vh]">
      <button
        data-testid="lang-toggle-title"
        aria-label={lang === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
        onClick={() => { playSound('click'); setLang(lang === 'en' ? 'vi' : 'en'); }}
        className="absolute right-4 top-4 cursor-pointer font-pixel p-2 text-xs text-white drop-shadow"
      >
        <Icon name="globe" /> {lang.toUpperCase()}
      </button>
      <h1>
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="CodeCraft"
          className="w-[20rem] max-w-[85vw] sm:w-[30rem] [image-rendering:pixelated] drop-shadow-[3px_3px_0_#0006]"
        />
      </h1>
      <div className="flex flex-col items-center gap-6">
        <p className="font-body text-xl font-bold text-night">{t('tagline')}</p>
        <PixelButton className="text-xl" onClick={() => navigate('/players')}>
          <Icon name="next" /> {t('pressStart')}
        </PixelButton>
      </div>
    </div>
  );
}
