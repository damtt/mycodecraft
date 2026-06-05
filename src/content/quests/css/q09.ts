import type { Quest } from '../../../lib/types';

export const q09: Quest = {
  id: 'css-09',
  world: 'css',
  xp: 75,
  badge: 'b-potion',
  title: { en: 'Magic Potions', vi: 'Thuốc tiên phép thuật' },
  story: {
    en: 'Potions change things when you touch them! Make a button that reacts when your mouse hovers over it, and add a smooth transition.',
    vi: 'Thuốc tiên thay đổi mọi thứ khi bạn chạm vào! Hãy làm một nút phản ứng khi chuột rê lên nó, và thêm một transition mượt mà.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag. You will give the button a hover effect.',
        vi: 'Tìm tag `<style>`. Bạn sẽ cho cái nút một hiệu ứng hover.',
      },
    },
    {
      text: {
        en: 'Add a hover rule: write `button:hover` and change the `background-color`. `:hover` means "when the mouse is on top".',
        vi: 'Thêm một quy tắc hover: viết `button:hover` và đổi `background-color`. `:hover` nghĩa là "khi chuột nằm trên nó".',
      },
      hint: {
        en: "It looks like this:\n```\nbutton:hover {\n  background-color: gold;\n}\n```",
        vi: "Nó trông như thế này:\n```\nbutton:hover {\n  background-color: gold;\n}\n```",
      },
    },
    {
      text: {
        en: 'Make the change smooth: in a `button` rule add `transition` so the color fades slowly instead of snapping.',
        vi: 'Làm cho thay đổi mượt mà: trong quy tắc `button` thêm `transition` để màu chuyển từ từ thay vì đổi giật.',
      },
      hint: {
        en: "Add a rule for the button:\n```\nbutton {\n  transition: 0.3s;\n}\n```",
        vi: "Thêm một quy tắc cho nút:\n```\nbutton {\n  transition: 0.3s;\n}\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🧪 Your CSS goes here */\n\n</style>\n\n<button>Drink</button>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: ':hover',
      failMessage: {
        en: 'I do not see a hover effect yet. Add a rule like: `button:hover { background-color: gold; }`',
        vi: 'Mình chưa thấy hiệu ứng hover. Thêm một quy tắc như: `button:hover { background-color: gold; }`',
      },
    },
    {
      type: 'codeIncludes',
      value: 'transition',
      failMessage: {
        en: 'The change needs to be smooth. Add a button rule with: `transition: 0.3s;`',
        vi: 'Thay đổi cần mượt mà. Thêm một quy tắc button với: `transition: 0.3s;`',
      },
    },
  ],
};
