import type { World } from '../lib/types';

export const WORLDS: World[] = [
  {
    id: 'html', icon: '🟫',
    name: { en: 'HTML Grasslands', vi: 'Đồng cỏ HTML' },
    tagline: { en: 'Build with blocks of text', vi: 'Xây dựng bằng các khối văn bản' },
  },
  {
    id: 'css', icon: '🟦',
    name: { en: 'CSS Caves', vi: 'Hang động CSS' },
    tagline: { en: 'Paint and decorate your world', vi: 'Tô màu và trang trí thế giới' },
  },
  {
    id: 'js', icon: '🟨',
    name: { en: 'JS Sparkstone Mines', vi: 'Mỏ Sparkstone JS' },
    tagline: { en: 'Make things move and think', vi: 'Làm mọi thứ chuyển động và suy nghĩ' },
  },
];
