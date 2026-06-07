import type { Quest } from '../../../lib/types';

export const q03: Quest = {
  id: 'js-03',
  world: 'js',
  xp: 50,
  badge: 'b-emerald',
  title: { en: 'Stack the Blocks', vi: 'Xếp chồng khối' },
  story: {
    en: 'One stack of blocks is 64. You have 2 full stacks — how many blocks is that? JavaScript can do the math for you!',
    vi: 'Một chồng khối là 64. Bạn có 2 chồng đầy — vậy là bao nhiêu khối? JavaScript có thể tính giúp bạn!',
  },
  steps: [
    {
      text: {
        en: 'JavaScript can multiply with the `*` sign. Multiply 64 by 2 to count two full stacks.',
        vi: 'JavaScript có thể nhân bằng dấu `*`. Hãy nhân 64 với 2 để đếm hai chồng đầy.',
      },
      hint: {
        en: 'The `*` means times: `64 * 2`',
        vi: 'Dấu `*` nghĩa là nhân: `64 * 2`',
      },
    },
    {
      text: {
        en: 'Print the answer with `console.log`. The number 128 should appear in the Console panel.',
        vi: 'In kết quả ra bằng `console.log`. Số 128 sẽ hiện ra ở bảng Console.',
      },
      hint: {
        en: 'Put the math right inside the log: `console.log(64 * 2);`',
        vi: 'Đặt phép tính ngay trong log: `console.log(64 * 2);`',
      },
    },
  ],
  starterCode:
    '<h1>Block Counter</h1>\n\n<script>\n  // 🧮 Multiply the stacks and log the total\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: '*',
      failMessage: {
        en: "I don't see a multiply sign yet. Use `*` to multiply, like `64 * 2`.",
        vi: 'Mình chưa thấy dấu nhân nào. Dùng `*` để nhân nhé, ví dụ `64 * 2`.',
      },
    },
    {
      type: 'consoleIncludes',
      value: '128',
      failMessage: {
        en: 'The console should show 128. Try `console.log(64 * 2);`',
        vi: 'Console cần hiện số 128. Thử `console.log(64 * 2);` nhé',
      },
    },
  ],
  predict: {
    question: { en: 'If you change `64 * 2` to `64 + 2`, what will the Console show?', vi: 'Nếu bạn đổi `64 * 2` thành `64 + 2`, Console sẽ hiện gì?' },
    options: [
      { text: { en: '66', vi: '66' }, correct: true },
      { text: { en: '128', vi: '128' }, correct: false },
      { text: { en: '642', vi: '642' }, correct: false },
    ],
    explain: { en: '`+` adds the numbers, so `64 + 2` is 66. `*` multiplies them, which is how two stacks made 128.', vi: '`+` cộng các số lại, nên `64 + 2` là 66. `*` nhân chúng, đó là cách hai chồng tạo ra 128.' },
  },
};
