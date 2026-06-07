import type { Quest } from '../../../lib/types';

export const q04: Quest = {
  id: 'html-04',
  world: 'html',
  xp: 50,
  badge: 'b-ladder',
  title: { en: 'Crafting List', vi: 'Danh sách chế tạo' },
  story: {
    en: 'Before a big build you need to gather blocks. Make a checklist of everything in your chest so you do not forget anything!',
    vi: 'Trước một công trình lớn, bạn cần gom đủ khối. Hãy làm một danh sách mọi thứ trong rương để không quên gì cả!',
  },
  steps: [
    {
      text: {
        en: 'A list of items uses the `<ul>` tag. ul means "unordered list" — a bullet list. Add an empty `<ul></ul>` under the heading.',
        vi: 'Một danh sách các món dùng tag `<ul>`. ul nghĩa là "unordered list" — danh sách có dấu chấm tròn. Thêm một `<ul></ul>` trống bên dưới tiêu đề.',
      },
      hint: {
        en: "An empty list looks like this:\n```\n<ul>\n</ul>\n```",
        vi: "Một danh sách trống trông như thế này:\n```\n<ul>\n</ul>\n```",
      },
    },
    {
      text: {
        en: 'Each item on the list goes inside an `<li>` tag. li means "list item". Put 3 items inside your `<ul>`, like Wood, Stone, Torches.',
        vi: 'Mỗi món trong danh sách nằm trong một tag `<li>`. li nghĩa là "list item" (món trong danh sách). Bỏ 3 món vào trong `<ul>`, ví dụ Wood, Stone, Torches.',
      },
      hint: {
        en: "Items go inside the list:\n```\n<ul>\n  <li>Wood</li>\n  <li>Stone</li>\n  <li>Torches</li>\n</ul>\n```",
        vi: "Các món nằm trong danh sách:\n```\n<ul>\n  <li>Wood</li>\n  <li>Stone</li>\n  <li>Torches</li>\n</ul>\n```",
      },
    },
  ],
  starterCode:
    '<h2>My chest</h2>\n<!-- ⛏️ Build your list below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'ul',
      failMessage: {
        en: "I don't see a list yet. A bullet list starts with `<ul>` and ends with `</ul>`!",
        vi: 'Mình chưa thấy danh sách nào. Một danh sách dấu tròn bắt đầu bằng `<ul>` và kết thúc bằng `</ul>`!',
      },
    },
    {
      type: 'elementCount',
      selector: 'li',
      min: 3,
      failMessage: {
        en: "Your list needs at least 3 items. Add more `<li>...</li>` lines inside the `<ul>`!",
        vi: 'Danh sách của bạn cần ít nhất 3 món. Thêm các dòng `<li>...</li>` nữa vào trong `<ul>` nhé!',
      },
    },
  ],
  reflect: {
    question: {
      en: 'What job does the `<ul>` do, and what job does each `<li>` do?',
      vi: '`<ul>` làm việc gì, và mỗi `<li>` làm việc gì?',
    },
    answer: {
      en: 'The `<ul>` is the basket that holds the whole list together; each `<li>` wraps one single item so the browser knows where to put its own bullet point.',
      vi: '`<ul>` là cái giỏ gom cả danh sách lại với nhau; mỗi `<li>` bọc đúng một món để trình duyệt biết chấm tròn của món đó đặt ở đâu.',
    },
  },
};
