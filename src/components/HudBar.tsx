import { Link } from 'react-router';
import { useActiveProfile } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';
import { useT } from '../lib/i18n';
import { HOME_ITEM, SCREEN_NAV } from '../lib/nav';
import { streakDisplay, todayString } from '../features/progress/streak';
import { playSound } from '../features/audio/sounds';
import XpBar from './XpBar';
import Icon from './Icon';
import Avatar from './Avatar';

export default function HudBar() {
  const profile = useActiveProfile();
  const { lang, t } = useT();
  const { soundOn, toggleSound, setLang } = useSettings();
  if (!profile) return null;

  const streak = streakDisplay(profile.streak, todayString());

  return (
    <header className="flex items-center gap-3 border-b-4 border-grass-dark bg-night px-3 py-2 text-white sm:gap-4 sm:px-4">
      <Link
        to={HOME_ITEM.to}
        aria-label={t(HOME_ITEM.key)}
        title={t(HOME_ITEM.key)}
        onClick={() => playSound('click')}
        className="text-2xl leading-none"
      >
        <Icon name={HOME_ITEM.icon} />
      </Link>
      <Link to="/players" className="text-2xl" title={profile.name}><Avatar value={profile.avatar} /></Link>
      <span className="hidden font-pixel text-xs text-white drop-shadow-[1px_1px_0_#000] sm:inline">{profile.name}</span>
      <XpBar xp={profile.xp} />
      <span className="flex items-center gap-0.5 font-body font-bold" data-testid="streak"><Icon name="fire" />{streak}</span>
      {/* Decorative hearts — hidden on phone to save the row (spec §Gamification) */}
      <span aria-hidden className="hidden gap-0.5 text-sm sm:flex">
        <Icon name="heart" /><Icon name="heart" /><Icon name="heart" />
      </span>
      <nav className="ml-auto flex items-center gap-3 font-body font-bold">
        {/* Screen-nav links live in BottomNav on phones; shown here from md up. */}
        {SCREEN_NAV.map((item) => (
          <Link key={item.to} to={item.to} onClick={() => playSound('click')} className="hidden items-center gap-1 md:inline-flex">
            <Icon name={item.icon} /> {t(item.key)}
          </Link>
        ))}
        <button onClick={() => { playSound('click'); toggleSound(); }} title={t('sound')} className="cursor-pointer p-1 text-lg">
          <Icon name={soundOn ? 'volume' : 'muted'} />
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
