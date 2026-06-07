import type { Quest } from '../../../lib/types';

export const q05: Quest = {
  id: 'js-05',
  world: 'js',
  xp: 75,
  badge: 'b-command',
  title: { en: 'Crafting Recipes', vi: 'Công thức chế tạo' },
  story: {
    en: 'A recipe is a set of steps you can use again and again. A function is a recipe in code — name it once, then run it any time!',
    vi: 'Một công thức là chuỗi các bước bạn dùng đi dùng lại. Function là một công thức trong code — đặt tên một lần, rồi chạy bất cứ khi nào!',
  },
  steps: [
    {
      text: {
        en: "Write a `function` named `greet` that takes a `name`. Inside, `console.log` the words Hello,  then the name, then an !  For `greet('Steve')` it should say Hello, Steve!",
        vi: "Viết một `function` tên `greet` nhận vào một `name`. Bên trong, `console.log` chữ Hello,  rồi tên, rồi dấu !  Với `greet('Steve')` nó phải nói Hello, Steve!",
      },
      hint: {
        en: "Glue words with `+`:\n```\nfunction greet(name) {\n  console.log('Hello, ' + name + '!');\n}\n```",
        vi: "Nối chữ bằng `+`:\n```\nfunction greet(name) {\n  console.log('Hello, ' + name + '!');\n}\n```",
      },
    },
    {
      text: {
        en: "Now call your recipe with the name Steve so Hello, Steve! appears in the Console panel.",
        vi: 'Bây giờ gọi công thức của bạn với tên Steve để Hello, Steve! hiện ra ở bảng Console.',
      },
      hint: {
        en: "Run it like this: `greet('Steve');`",
        vi: "Chạy nó như thế này: `greet('Steve');`",
      },
    },
  ],
  starterCode:
    '<h1>Crafting Table</h1>\n\n<script>\n  // 🛠️ Write a greet function, then call it with Steve\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: 'function',
      failMessage: {
        en: "I don't see a `function` yet. Start it with the word `function`, like `function greet(name) { ... }`",
        vi: 'Mình chưa thấy `function` nào. Bắt đầu bằng từ `function` nhé, ví dụ `function greet(name) { ... }`',
      },
    },
    {
      type: 'consoleIncludes',
      value: 'Hello, Steve!',
      failMessage: {
        en: "The console should say Hello, Steve! Build it with `'Hello, ' + name + '!'` and call `greet('Steve');`",
        vi: "Console cần nói Hello, Steve! Ghép bằng `'Hello, ' + name + '!'` và gọi `greet('Steve');` nhé",
      },
    },
  ],
  experiment: {
    en: 'Try calling your recipe more than once: `greet(\'Alex\');` then `greet(\'Steve\');`. Run it and watch the Console — one function, written once, can greet anybody you hand it! Add as many calls as you like — this part is not graded.',
    vi: 'Hãy thử gọi công thức của bạn nhiều hơn một lần: `greet(\'Alex\');` rồi `greet(\'Steve\');`. Chạy thử và xem Console — một function, viết một lần, có thể chào bất cứ ai bạn đưa cho nó! Thêm bao nhiêu lời gọi cũng được — phần này không bị chấm điểm đâu.',
  },
};
