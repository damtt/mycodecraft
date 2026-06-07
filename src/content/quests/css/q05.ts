import type { Quest } from '../../../lib/types';

export const q05: Quest = {
  id: 'css-05',
  world: 'css',
  xp: 75,
  badge: 'b-glass',
  title: { en: 'Resize Blocks', vi: 'Đổi cỡ khối' },
  story: {
    en: 'Glass blocks come in any size you want. Stretch this stone block to the exact size for your build.',
    vi: 'Khối kính có thể to nhỏ tùy ý. Hãy kéo khối đá này đúng kích cỡ cho công trình của bạn.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag. You will resize the block with class `block`.',
        vi: 'Tìm tag `<style>`. Bạn sẽ đổi cỡ khối có class `block`.',
      },
    },
    {
      text: {
        en: 'Make it wide: select `.block` and set `width` to `200px`. `width` is how wide a block is.',
        vi: 'Làm nó rộng: chọn `.block` và đặt `width` thành `200px`. `width` là khối rộng bao nhiêu.',
      },
      hint: {
        en: "It looks like this:\n```\n.block {\n  width: 200px;\n}\n```",
        vi: "Nó trông như thế này:\n```\n.block {\n  width: 200px;\n}\n```",
      },
    },
    {
      text: {
        en: 'Make it tall: in the same `.block` rule set `height` to `100px`. `height` is how tall a block is.',
        vi: 'Làm nó cao: trong cùng quy tắc `.block` đặt `height` thành `100px`. `height` là khối cao bao nhiêu.',
      },
      hint: {
        en: "Add this line inside the rule:\n```\n  height: 100px;\n```",
        vi: "Thêm dòng này vào trong quy tắc:\n```\n  height: 100px;\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🪟 Your CSS goes here */\n\n</style>\n\n<div class="block">Stone</div>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: '.block',
      prop: 'width',
      equalsAny: ['200px'],
      failMessage: {
        en: 'The block is not 200px wide yet. Inside `<style>`, write: `.block { width: 200px; }`',
        vi: 'Khối chưa rộng 200px. Bên trong `<style>`, hãy viết: `.block { width: 200px; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: '.block',
      prop: 'height',
      equalsAny: ['100px'],
      failMessage: {
        en: 'The block needs a height. In the `.block` rule, add: `height: 100px;`',
        vi: 'Khối cần một chiều cao. Trong quy tắc `.block`, thêm: `height: 100px;`',
      },
    },
  ],
  experiment: {
    en: 'Build something! Set `width` to `300px` and `height` to `40px` for a long bar, or make both `80px` for a little cube. Run after each change and watch the block reshape.',
    vi: 'Xây thử gì đó nào! Đặt `width` thành `300px` và `height` thành `40px` để có một thanh dài, hoặc cho cả hai bằng `80px` để được một khối vuông nhỏ. Chạy lại sau mỗi lần đổi và xem khối biến hình nhé.',
  },
};
