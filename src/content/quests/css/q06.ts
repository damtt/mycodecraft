import type { Quest } from '../../../lib/types';

export const q06: Quest = {
  id: 'css-06',
  world: 'css',
  xp: 75,
  badge: 'b-nametag',
  title: { en: 'Name Tags', vi: 'Thẻ tên' },
  story: {
    en: 'Name tags let you label mobs! A class can tag many mobs, but an id tags just one special boss.',
    vi: 'Thẻ tên giúp bạn gắn nhãn cho quái! Một class có thể gắn nhiều quái, còn một id chỉ gắn cho một con trùm đặc biệt.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag. One mob has class `mob`, and the boss has id `boss`.',
        vi: 'Tìm tag `<style>`. Một con quái có class `mob`, còn trùm có id `boss`.',
      },
    },
    {
      text: {
        en: 'Color the mob: select a class with a dot, so write `.mob` and set `color` to `green`.',
        vi: 'Tô màu cho quái: chọn một class bằng dấu chấm, nên viết `.mob` và đặt `color` thành `green`.',
      },
      hint: {
        en: "A class uses a dot:\n```\n.mob {\n  color: green;\n}\n```",
        vi: "Một class dùng dấu chấm:\n```\n.mob {\n  color: green;\n}\n```",
      },
    },
    {
      text: {
        en: 'Color the boss: select an id with a hash, so write `#boss` and set `color` to `red`.',
        vi: 'Tô màu cho trùm: chọn một id bằng dấu thăng, nên viết `#boss` và đặt `color` thành `red`.',
      },
      hint: {
        en: "An id uses a hash:\n```\n#boss {\n  color: red;\n}\n```",
        vi: "Một id dùng dấu thăng:\n```\n#boss {\n  color: red;\n}\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🏷️ Your CSS goes here */\n\n</style>\n\n<p class="mob">Zombie</p>\n<p id="boss">Ender Dragon</p>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: '.mob',
      prop: 'color',
      equalsAny: ['green', 'rgb(0, 128, 0)'],
      failMessage: {
        en: 'The mob is not green yet. Inside `<style>`, write: `.mob { color: green; }`',
        vi: 'Con quái chưa có màu xanh lá. Bên trong `<style>`, hãy viết: `.mob { color: green; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: '#boss',
      prop: 'color',
      equalsAny: ['red', 'rgb(255, 0, 0)'],
      failMessage: {
        en: 'The boss is not red yet. Inside `<style>`, write: `#boss { color: red; }`',
        vi: 'Trùm chưa có màu đỏ. Bên trong `<style>`, hãy viết: `#boss { color: red; }`',
      },
    },
  ],
  reflect: {
    question: { en: 'You wrote `.mob` with a dot and `#boss` with a hash. What do the dot and the hash tell the browser to look for?', vi: 'Bạn viết `.mob` với dấu chấm và `#boss` với dấu thăng. Dấu chấm và dấu thăng bảo trình duyệt đi tìm cái gì?' },
    answer: { en: 'A dot means "a class" — a name lots of mobs can share, so the rule can tag a whole group. A hash means "an id" — a name only one element may wear, so it tags just that single boss.', vi: 'Dấu chấm nghĩa là "một class" — một cái tên mà nhiều con quái cùng dùng được, nên quy tắc gắn cho cả một nhóm. Dấu thăng nghĩa là "một id" — cái tên chỉ một phần tử được mang, nên nó chỉ gắn riêng cho con trùm đó.' },
  },
};
