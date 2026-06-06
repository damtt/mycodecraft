import { Link } from 'react-router';
import { useActiveProfile } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';
import { useT } from '../lib/i18n';
import { streakDisplay, todayString } from '../features/progress/streak';
import { playSound } from '../features/audio/sounds';
import XpBar from './XpBar';

export default function HudBar() {
  const profile = useActiveProfile();
  const { lang, t } = useT();
  const { soundOn, toggleSound, setLang } = useSettings();
  if (!profile) return null;

  const streak = streakDisplay(profile.streak, todayString());

  return (
    <header className="flex items-center gap-3 border-b-4 border-grass-dark bg-night px-3 py-2 text-white sm:gap-4 sm:px-4">
      <Link
        to="/"
        aria-label={t('home')}
        title={t('home')}
        onClick={() => playSound('click')}
        className="font-pixel text-base leading-none"
      >
        🏠
      </Link>
      <Link to="/players" className="text-2xl" title={profile.name}>{profile.avatar}</Link>
      <span className="hidden font-pixel text-xs text-white drop-shadow-[1px_1px_0_#000] sm:inline">{profile.name}</span>
      <XpBar xp={profile.xp} />
      <span className="font-body font-bold" data-testid="streak">🔥{streak}</span>
      {/* Decorative hearts — hidden on phone to save the row (spec §Gamification) */}
      <span aria-hidden className="hidden text-sm tracking-tighter sm:inline">❤️❤️❤️</span>
      <nav className="ml-auto flex items-center gap-3 font-body font-bold">
        {/* Screen-nav links live in BottomNav on phones; shown here from md up. */}
        <Link to="/map" onClick={() => playSound('click')} className="hidden md:inline">🗺️ {t('worldMap')}</Link>
        <Link to="/inventory" onClick={() => playSound('click')} className="hidden md:inline">🧰 {t('inventory')}</Link>
        <Link to="/settings" onClick={() => playSound('click')} className="hidden md:inline">⚙️ {t('settings')}</Link>
        <button onClick={() => { playSound('click'); toggleSound(); }} title={t('sound')} className="cursor-pointer p-1 text-lg">
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          onClick={() => { playSound('click'); setLang(lang === 'en' ? 'vi' : 'en'); }}
          className="cursor-pointer p-1 font-pixel text-xs uppercase"
          data-testid="lang-toggle"
        >
          {lang}
        </button>
      </nav>
    </header>
  );
}
