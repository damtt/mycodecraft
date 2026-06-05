import type { Quest } from '../../../lib/types';

export const q08: Quest = {
  id: 'js-08',
  world: 'js',
  xp: 75,
  badge: 'b-minecart',
  title: { en: 'Minecart Loop', vi: 'Vòng lặp xe mỏ' },
  story: {
    en: 'A minecart rolls down the track, mining block after block. A `for` loop repeats your code many times — no copy-paste needed!',
    vi: 'Một chiếc xe mỏ lăn dọc đường ray, đào hết khối này đến khối khác. Vòng lặp `for` lặp lại code của bạn nhiều lần — không cần copy-paste!',
  },
  steps: [
    {
      text: {
        en: 'Write a `for` loop that counts `i` from 1 up to 5. The loop body runs once for each number.',
        vi: 'Viết một vòng lặp `for` đếm `i` từ 1 đến 5. Phần thân vòng lặp chạy một lần cho mỗi số.',
      },
      hint: {
        en: "It looks like this:\n```\nfor (let i = 1; i <= 5; i++) {\n  // body runs 5 times\n}\n```",
        vi: "Nó trông như thế này:\n```\nfor (let i = 1; i <= 5; i++) {\n  // thân chạy 5 lần\n}\n```",
      },
    },
    {
      text: {
        en: 'Inside the loop, `console.log` `` `Mined block ${i}` ``. The last line in the Console panel will read Mined block 5.',
        vi: 'Bên trong vòng lặp, `console.log` `` `Mined block ${i}` ``. Dòng cuối ở bảng Console sẽ ghi Mined block 5.',
      },
      hint: {
        en: "Use backticks so `${i}` becomes the number:\n```\nconsole.log(`Mined block ${i}`);\n```",
        vi: "Dùng dấu backtick để `${i}` biến thành số:\n```\nconsole.log(`Mined block ${i}`);\n```",
      },
    },
  ],
  starterCode:
    '<h1>Mine Track</h1>\n\n<script>\n  // 🛒 Loop from 1 to 5 and log each mined block\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: 'for',
      failMessage: {
        en: "I don't see a `for` loop yet. Start it with `for (let i = 1; i <= 5; i++) { ... }`",
        vi: 'Mình chưa thấy vòng lặp `for` nào. Bắt đầu bằng `for (let i = 1; i <= 5; i++) { ... }` nhé.',
      },
    },
    {
      type: 'consoleIncludes',
      value: 'Mined block 5',
      failMessage: {
        en: 'The console should reach Mined block 5. Inside the loop, log `` `Mined block ${i}` `` and loop up to 5.',
        vi: 'Console cần chạy đến Mined block 5. Bên trong vòng lặp, log `` `Mined block ${i}` `` và lặp đến 5 nhé.',
      },
    },
  ],
};
