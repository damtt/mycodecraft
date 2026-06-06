import type { UIKey } from '../content/i18n/ui';
import type { IconName } from '../components/Icon';

export interface NavItem {
  to: string;
  icon: IconName;
  key: UIKey; // i18n label key
}

/**
 * Single source of truth for the in-game navigation destinations, so the two
 * nav surfaces can't drift. HudBar renders SCREEN_NAV from `md` up; BottomNav
 * renders the full list (Home + screens) on phones.
 */
export const HOME_ITEM: NavItem = { to: '/', icon: 'house', key: 'home' };

export const SCREEN_NAV: NavItem[] = [
  { to: '/map', icon: 'map', key: 'worldMap' },
  { to: '/inventory', icon: 'toolbox', key: 'inventory' },
  { to: '/settings', icon: 'gear', key: 'settings' },
];
