import type { Quest } from '../../../lib/types';

export const q10: Quest = {
  id: 'css-10',
  world: 'css',
  xp: 100,
  badge: 'b-diamond',
  title: { en: 'BOSS: Style the Fan Page', vi: 'TRÙM: Tạo kiểu trang người hâm mộ' },
  story: {
    en: 'Boss quest! Your fan page already works — now make it beautiful with everything you learned in the caves: colors, corners, and a flex layout.',
    vi: 'Nhiệm vụ trùm! Trang người hâm mộ của bạn đã chạy được — giờ hãy làm nó thật đẹp với mọi thứ bạn học trong hang động: màu sắc, góc bo tròn, và bố cục flex.',
  },
  steps: [
    {
      text: {
        en: 'Find the empty `<style>` tag at the top. Every rule below goes inside it.',
        vi: 'Tìm tag `<style>` trống ở trên cùng. Mọi quy tắc bên dưới đều nằm trong nó.',
      },
    },
    {
      text: {
        en: 'Paint the page: select `body` and set `background-color` to `lightyellow`. `body` means the whole page.',
        vi: 'Tô màu trang: chọn `body` và đặt `background-color` thành `lightyellow`. `body` nghĩa là toàn bộ trang.',
      },
      hint: {
        en: "It looks like this:\n```\nbody {\n  background-color: lightyellow;\n}\n```",
        vi: "Nó trông như thế này:\n```\nbody {\n  background-color: lightyellow;\n}\n```",
      },
    },
    {
      text: {
        en: 'Color the title: select `h1` and set `color` to `green`.',
        vi: 'Tô màu tiêu đề: chọn `h1` và đặt `color` thành `green`.',
      },
      hint: {
        en: "It looks like this:\n```\nh1 {\n  color: green;\n}\n```",
        vi: "Nó trông như thế này:\n```\nh1 {\n  color: green;\n}\n```",
      },
    },
    {
      text: {
        en: 'Round the card corners: select `.card` and set `border-radius` to `12px`. `border-radius` rounds the corners.',
        vi: 'Bo tròn góc thẻ: chọn `.card` và đặt `border-radius` thành `12px`. `border-radius` làm cho các góc tròn lại.',
      },
      hint: {
        en: "It looks like this:\n```\n.card {\n  border-radius: 12px;\n}\n```",
        vi: "Nó trông như thế này:\n```\n.card {\n  border-radius: 12px;\n}\n```",
      },
    },
    {
      text: {
        en: 'Lay the cards side by side: select `.cards` and set `display` to `flex`.',
        vi: 'Đặt các thẻ cạnh nhau: chọn `.cards` và đặt `display` thành `flex`.',
      },
      hint: {
        en: "It looks like this:\n```\n.cards {\n  display: flex;\n}\n```",
        vi: "Nó trông như thế này:\n```\n.cards {\n  display: flex;\n}\n```",
      },
    },
    {
      text: {
        en: 'Look over your page — yellow background, green title, rounded cards, and a flex row. When it all looks great, you beat the Caves boss!',
        vi: 'Xem lại trang của bạn — nền vàng, tiêu đề xanh lá, thẻ bo tròn, và một hàng flex. Khi mọi thứ đẹp rồi, bạn đã hạ trùm Hang động!',
      },
    },
  ],
  starterCode:
    '<style>\n  /* 💎 Make your fan page beautiful here */\n\n</style>\n\n<h1>My Diamond Fan Page</h1>\n<img src="https://picsum.photos/200" alt="A shiny diamond">\n<ul>\n  <li>Diamonds are super rare.</li>\n  <li>You need an iron pickaxe to mine them.</li>\n  <li>They make the best tools.</li>\n</ul>\n<div class="cards">\n  <div class="card">Pickaxe</div>\n  <div class="card">Sword</div>\n</div>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: 'body',
      prop: 'background-color',
      equalsAny: ['lightyellow', 'rgb(255, 255, 224)'],
      failMessage: {
        en: 'The page is still plain. Inside `<style>`, write: `body { background-color: lightyellow; }`',
        vi: 'Trang vẫn còn trống trơn. Bên trong `<style>`, hãy viết: `body { background-color: lightyellow; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: 'h1',
      prop: 'color',
      equalsAny: ['green', 'rgb(0, 128, 0)'],
      failMessage: {
        en: 'The title is not green yet. Inside `<style>`, write: `h1 { color: green; }`',
        vi: 'Tiêu đề chưa có màu xanh lá. Bên trong `<style>`, hãy viết: `h1 { color: green; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: '.card',
      prop: 'border-radius',
      equalsAny: ['12px'],
      failMessage: {
        en: 'The cards still have sharp corners. Inside `<style>`, write: `.card { border-radius: 12px; }`',
        vi: 'Các thẻ vẫn còn góc nhọn. Bên trong `<style>`, hãy viết: `.card { border-radius: 12px; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: '.cards',
      prop: 'display',
      equalsAny: ['flex'],
      failMessage: {
        en: 'The cards are not in a flex row yet. Inside `<style>`, write: `.cards { display: flex; }`',
        vi: 'Các thẻ chưa thành hàng flex. Bên trong `<style>`, hãy viết: `.cards { display: flex; }`',
      },
    },
  ],
};
