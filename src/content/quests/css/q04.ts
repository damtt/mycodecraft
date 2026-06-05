import type { Quest } from '../../../lib/types';

export const q04: Quest = {
  id: 'css-04',
  world: 'css',
  xp: 75,
  badge: 'b-shield',
  title: { en: 'Armor Up', vi: 'Mặc giáp' },
  story: {
    en: 'Every block of armor needs a strong edge and some padding inside. Give your box a border and breathing room.',
    vi: 'Mỗi mảnh giáp cần một viền chắc chắn và chút đệm bên trong. Hãy cho cái hộp của bạn một viền và khoảng trống để thở.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag. You will style the box with class `box`.',
        vi: 'Tìm tag `<style>`. Bạn sẽ tạo kiểu cho cái hộp có class `box`.',
      },
    },
    {
      text: {
        en: 'Add a border: select `.box` and set `border` to `2px solid black`. A border is the line around the edge.',
        vi: 'Thêm một viền: chọn `.box` và đặt `border` thành `2px solid black`. Viền là đường bao quanh mép.',
      },
      hint: {
        en: "It looks like this:\n```\n.box {\n  border: 2px solid black;\n}\n```",
        vi: "Nó trông như thế này:\n```\n.box {\n  border: 2px solid black;\n}\n```",
      },
    },
    {
      text: {
        en: 'Add padding: in the same `.box` rule set `padding` to `16px`. `padding` is the space inside, between the border and the text.',
        vi: 'Thêm padding: trong cùng quy tắc `.box` đặt `padding` thành `16px`. `padding` là khoảng trống bên trong, giữa viền và chữ.',
      },
      hint: {
        en: "Add this line inside the rule:\n```\n  padding: 16px;\n```",
        vi: "Thêm dòng này vào trong quy tắc:\n```\n  padding: 16px;\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🛡️ Your CSS goes here */\n\n</style>\n\n<div class="box">Armor</div>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: '.box',
      prop: 'border-top-style',
      equalsAny: ['solid'],
      failMessage: {
        en: 'The box has no border yet. Inside `<style>`, write: `.box { border: 2px solid black; }`',
        vi: 'Cái hộp chưa có viền. Bên trong `<style>`, hãy viết: `.box { border: 2px solid black; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: '.box',
      prop: 'padding-top',
      equalsAny: ['16px'],
      failMessage: {
        en: 'The box needs padding inside. In the `.box` rule, add: `padding: 16px;`',
        vi: 'Cái hộp cần padding bên trong. Trong quy tắc `.box`, thêm: `padding: 16px;`',
      },
    },
  ],
};
