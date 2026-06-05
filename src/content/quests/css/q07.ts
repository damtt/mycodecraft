import type { Quest } from '../../../lib/types';

export const q07: Quest = {
  id: 'css-07',
  world: 'css',
  xp: 75,
  badge: 'b-rail',
  title: { en: 'Lay the Rails', vi: 'Đặt đường ray' },
  story: {
    en: 'Rails line up in a neat row. Use flex to set blocks side by side, with a little gap between them.',
    vi: 'Đường ray xếp thành một hàng gọn gàng. Dùng flex để đặt các khối cạnh nhau, với một khoảng nhỏ ở giữa.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag. You will lay out the row with class `row`.',
        vi: 'Tìm tag `<style>`. Bạn sẽ sắp xếp hàng có class `row`.',
      },
    },
    {
      text: {
        en: 'Put the items in a row: select `.row` and set `display` to `flex`. `flex` lines children up side by side.',
        vi: 'Đặt các món thành hàng: chọn `.row` và đặt `display` thành `flex`. `flex` xếp các con cạnh nhau.',
      },
      hint: {
        en: "It looks like this:\n```\n.row {\n  display: flex;\n}\n```",
        vi: "Nó trông như thế này:\n```\n.row {\n  display: flex;\n}\n```",
      },
    },
    {
      text: {
        en: 'Add space between them: in the same `.row` rule set `gap` to `10px`. `gap` is the space between flex items.',
        vi: 'Thêm khoảng cách giữa chúng: trong cùng quy tắc `.row` đặt `gap` thành `10px`. `gap` là khoảng trống giữa các món flex.',
      },
      hint: {
        en: "Add this line inside the rule:\n```\n  gap: 10px;\n```",
        vi: "Thêm dòng này vào trong quy tắc:\n```\n  gap: 10px;\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🛤️ Your CSS goes here */\n\n</style>\n\n<div class="row"><span>A</span><span>B</span></div>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: '.row',
      prop: 'display',
      equalsAny: ['flex'],
      failMessage: {
        en: 'The items are not in a flex row yet. Inside `<style>`, write: `.row { display: flex; }`',
        vi: 'Các món chưa thành hàng flex. Bên trong `<style>`, hãy viết: `.row { display: flex; }`',
      },
    },
    {
      type: 'computedStyle',
      selector: '.row',
      prop: 'gap',
      equalsAny: ['10px'],
      failMessage: {
        en: 'The items need a gap between them. In the `.row` rule, add: `gap: 10px;`',
        vi: 'Các món cần một khoảng cách ở giữa. Trong quy tắc `.row`, thêm: `gap: 10px;`',
      },
    },
  ],
};
