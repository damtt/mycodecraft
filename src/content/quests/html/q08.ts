import type { Quest } from '../../../lib/types';

export const q08: Quest = {
  id: 'html-08',
  world: 'html',
  xp: 75,
  badge: 'b-crafting',
  title: { en: 'Inventory Table', vi: 'Bảng kho đồ' },
  story: {
    en: 'Your inventory is a mess! A table has neat rows and boxes, perfect for lining up your items side by side.',
    vi: 'Kho đồ của bạn lộn xộn quá! Một cái bảng có hàng và ô gọn gàng, hợp để xếp các món đồ cạnh nhau ngay ngắn.',
  },
  steps: [
    {
      text: {
        en: 'A grid of boxes uses the `<table>` tag. Add an empty `<table></table>` below the heading.',
        vi: 'Một lưới các ô dùng tag `<table>`. Thêm một `<table></table>` trống bên dưới tiêu đề.',
      },
      hint: {
        en: "An empty table looks like this:\n```\n<table>\n</table>\n```",
        vi: "Một cái bảng trống trông như thế này:\n```\n<table>\n</table>\n```",
      },
    },
    {
      text: {
        en: 'A table has rows. Each row uses the `<tr>` tag. Inside the table, add 2 rows with `<tr></tr>`.',
        vi: 'Một cái bảng có các hàng. Mỗi hàng dùng tag `<tr>`. Trong bảng, thêm 2 hàng bằng `<tr></tr>`.',
      },
      hint: {
        en: "Rows go inside the table:\n```\n<table>\n  <tr></tr>\n  <tr></tr>\n</table>\n```",
        vi: "Các hàng nằm trong bảng:\n```\n<table>\n  <tr></tr>\n  <tr></tr>\n</table>\n```",
      },
    },
    {
      text: {
        en: 'Each box in a row uses the `<td>` tag. Put 2 boxes in each row, so you have at least 4 boxes in all.',
        vi: 'Mỗi ô trong một hàng dùng tag `<td>`. Bỏ 2 ô vào mỗi hàng, để tổng cộng có ít nhất 4 ô.',
      },
      hint: {
        en: "Boxes go inside rows:\n```\n<tr>\n  <td>Sword</td>\n  <td>Shield</td>\n</tr>\n```",
        vi: "Các ô nằm trong hàng:\n```\n<tr>\n  <td>Sword</td>\n  <td>Shield</td>\n</tr>\n```",
      },
    },
  ],
  starterCode:
    '<h2>My inventory</h2>\n<!-- ⛏️ Build your table below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'table',
      failMessage: {
        en: "I don't see a table yet. A grid of boxes starts with `<table>` and ends with `</table>`!",
        vi: 'Mình chưa thấy cái bảng nào. Một lưới các ô bắt đầu bằng `<table>` và kết thúc bằng `</table>`!',
      },
    },
    {
      type: 'elementCount',
      selector: 'td',
      min: 4,
      failMessage: {
        en: "Your table needs at least 4 boxes. Add more `<td>...</td>` boxes inside your rows!",
        vi: 'Cái bảng cần ít nhất 4 ô. Thêm các ô `<td>...</td>` nữa vào trong các hàng nhé!',
      },
    },
  ],
  reflect: {
    question: {
      en: 'Why does each `<td>` need to sit inside a `<tr>` instead of straight inside the `<table>`?',
      vi: 'Vì sao mỗi `<td>` phải nằm bên trong một `<tr>` chứ không nằm thẳng trong `<table>`?',
    },
    answer: {
      en: 'The `<tr>` marks one whole row across the table, and the `<td>` boxes inside it line up as that row\'s cells — so the `<tr>` tells the browser which boxes belong in the same row.',
      vi: '`<tr>` đánh dấu trọn một hàng ngang trong bảng, còn các ô `<td>` bên trong xếp thành các ô của hàng đó — nhờ vậy `<tr>` cho trình duyệt biết những ô nào nằm chung một hàng.',
    },
  },
};
