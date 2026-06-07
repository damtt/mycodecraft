import type { Quest } from '../../../lib/types';

export const q02: Quest = {
  id: 'js-02',
  world: 'js',
  xp: 50,
  badge: 'b-chest',
  title: { en: 'Treasure Chests', vi: 'Rương báu vật' },
  story: {
    en: 'A chest holds your loot. In JavaScript a variable is a labeled chest that holds a value — let us put a diamond inside!',
    vi: 'Một chiếc rương cất giữ chiến lợi phẩm của bạn. Trong JavaScript, variable là một chiếc rương có nhãn để giữ một giá trị — hãy bỏ một viên kim cương vào nào!',
  },
  steps: [
    {
      text: {
        en: 'Make a variable with `let`. A variable is a box with a name. Store the word diamond inside it.',
        vi: 'Tạo một variable bằng `let`. Variable là một cái hộp có tên. Hãy cất từ diamond vào trong đó.',
      },
      hint: {
        en: "Use `let` and quotes for words: `let loot = 'diamond';`",
        vi: "Dùng `let` và dấu nháy cho chữ: `let loot = 'diamond';`",
      },
    },
    {
      text: {
        en: 'Now print your variable with `console.log` so diamond shows in the Console panel.',
        vi: 'Bây giờ in variable của bạn bằng `console.log` để chữ diamond hiện ra ở bảng Console.',
      },
      hint: {
        en: 'Log the box, not new quotes: `console.log(loot);`',
        vi: 'In cái hộp ra, đừng dùng dấu nháy mới: `console.log(loot);`',
      },
    },
  ],
  starterCode:
    '<h1>Treasure Room</h1>\n\n<script>\n  // 📦 Store your loot in a variable, then log it\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: 'let',
      failMessage: {
        en: "I don't see a variable yet. Start it with the word `let`, like: `let loot = 'diamond';`",
        vi: "Mình chưa thấy variable nào. Bắt đầu bằng từ `let` nhé, ví dụ: `let loot = 'diamond';`",
      },
    },
    {
      type: 'consoleIncludes',
      value: 'diamond',
      failMessage: {
        en: "diamond isn't in the console yet. Put 'diamond' in your variable, then `console.log(loot);`",
        vi: "Chữ diamond chưa có trong console. Hãy cất 'diamond' vào variable, rồi `console.log(loot);` nhé",
      },
    },
  ],
  reflect: {
    question: { en: 'You wrote `console.log(loot)` with no quotes. Why not `console.log(\'loot\')` with quotes?', vi: 'Bạn viết `console.log(loot)` không có dấu nháy. Tại sao không phải `console.log(\'loot\')` có dấu nháy?' },
    answer: { en: 'Without quotes, `loot` is the chest\'s name, so JavaScript opens it and prints what is inside — diamond. With quotes, `\'loot\'` is just the plain word, so it would print the letters l-o-o-t.', vi: 'Không có dấu nháy, `loot` là tên chiếc rương, nên JavaScript mở nó ra và in thứ bên trong — diamond. Có dấu nháy, `\'loot\'` chỉ là chữ trơn, nên nó sẽ in ra các chữ cái l-o-o-t.' },
  },
};
