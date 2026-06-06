import { Link, useLocation } from 'react-router';
import { useT } from '../lib/i18n';
import { useIsWide } from '../lib/useMediaQuery';
import { HOME_ITEM, SCREEN_NAV } from '../lib/nav';
import { playSound } from '../features/audio/sounds';
import Icon from './Icon';

const ITEMS = [HOME_ITEM, ...SCREEN_NAV];

/** Phone-only bottom navigation. Hidden (unmounted) at >=768px where HudBar carries nav. */
export default function BottomNav() {
  const isWide = useIsWide();
  const { pathname } = useLocation();
  const { t } = useT();
  if (isWide) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t-4 border-grass-dark bg-night text-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {ITEMS.map((item) => {
        const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={t(item.key)}
            onClick={() => playSound('click')}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2 font-body text-[10px] font-bold ${active ? 'text-gold' : 'text-white'}`}
          >
            <span className="text-xl leading-none"><Icon name={item.icon} /></span>
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
