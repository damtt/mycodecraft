import { Link } from 'react-router';
import { useActiveProfile } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';
import { useT } from '../lib/i18n';
import { streakDisplay, todayString } from '../features/progress/streak';
import XpBar from './XpBar';

export default function HudBar() {
  const profile = useActiveProfile();
  const { lang, t } = useT();
  const { soundOn, toggleSound, setLang } = useSettings();
  if (!profile) return null;

  const streak = streakDisplay(profile.streak, todayString());

  return (
    <header className="flex items-center gap-4 border-b-4 border-grass-dark bg-night px-4 py-2 text-white">
      <Link to="/players" className="text-2xl" title={profile.name}>{profile.avatar}</Link>
      <span className="font-pixel text-xs text-white drop-shadow-[1px_1px_0_#000]">{profile.name}</span>
      <XpBar xp={profile.xp} />
      <span className="font-body font-bold" data-testid="streak">🔥{streak}</span>
      {/* Decorative hearts — no lives mechanic (spec §Gamification) */}
      <span aria-hidden className="text-sm tracking-tighter">❤️❤️❤️</span>
      <nav className="ml-auto flex items-center gap-3 font-body font-bold">
        <Link to="/map">🗺️ {t('worldMap')}</Link>
        <Link to="/inventory">🧰 {t('inventory')}</Link>
        <Link to="/settings">⚙️ {t('settings')}</Link>
        <button onClick={toggleSound} title={t('sound')} className="cursor-pointer">
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
          className="cursor-pointer font-pixel text-[10px] uppercase"
          data-testid="lang-toggle"
        >
          {lang}
        </button>
      </nav>
    </header>
  );
}
