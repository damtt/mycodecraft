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
  predict: {
    question: { en: 'If you change `gap: 10px` to `0px`, what will the row look like?', vi: 'Nếu bạn đổi `gap: 10px` thành `0px`, hàng sẽ trông như thế nào?' },
    options: [
      { text: { en: 'The two items sit right next to each other, touching', vi: 'Hai món nằm sát ngay cạnh nhau, chạm vào nhau' }, correct: true },
      { text: { en: 'The items stack on top of each other', vi: 'Các món chồng lên nhau' }, correct: false },
      { text: { en: 'The items spread to opposite ends', vi: 'Các món dạt ra hai đầu' }, correct: false },
    ],
    explain: { en: '`gap` only sets the space between flex items. With `0px` there is no space, so they touch — but `display: flex` still keeps them side by side in one row.', vi: '`gap` chỉ đặt khoảng cách giữa các món flex. Với `0px` thì không còn khoảng trống, nên chúng chạm nhau — nhưng `display: flex` vẫn giữ chúng cạnh nhau trên cùng một hàng.' },
  },
};
