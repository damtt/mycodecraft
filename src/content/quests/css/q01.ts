import type { Quest } from '../../../lib/types';

export const q01: Quest = {
  id: 'css-01',
  world: 'css',
  xp: 50,
  badge: 'b-red-dye',
  title: { en: 'Dye It Red', vi: 'Nhuộm màu đỏ' },
  story: {
    en: 'Deep in the caves you found red dye! CSS is the magic that paints your HTML. Time to color a heading.',
    vi: 'Sâu trong hang động bạn tìm thấy thuốc nhuộm đỏ! CSS là phép thuật tô màu cho HTML. Hãy tô màu cho tiêu đề nào.',
  },
  steps: [
    {
      text: {
        en: 'CSS lives inside a <style> tag. Find it at the top of the editor.',
        vi: 'CSS nằm trong tag <style>. Hãy tìm nó ở đầu trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Inside the style tag, make the h1 red: select it with h1, then set color to red.',
        vi: 'Bên trong tag style, làm cho h1 màu đỏ: chọn nó bằng h1, rồi đặt color thành red.',
      },
      hint: {
        en: 'It looks like this:\nh1 {\n  color: red;\n}',
        vi: 'Nó trông như thế này:\nh1 {\n  color: red;\n}',
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🎨 Your CSS goes here */\n\n</style>\n\n<h1>Welcome to my cave!</h1>\n<p>It is very cozy.</p>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: 'h1',
      prop: 'color',
      equalsAny: ['red', 'rgb(255, 0, 0)'],
      failMessage: {
        en: "The h1 isn't red yet. Inside <style>, write: h1 { color: red; }",
        vi: 'h1 chưa có màu đỏ. Bên trong <style>, hãy viết: h1 { color: red; }',
      },
    },
  ],
};
