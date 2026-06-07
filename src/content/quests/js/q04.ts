import type { Quest } from '../../../lib/types';

export const q04: Quest = {
  id: 'js-04',
  world: 'js',
  xp: 75,
  badge: 'b-zombie',
  title: { en: 'Creeper Alert', vi: 'Báo động Creeper' },
  story: {
    en: 'Sss… a creeper is close! Your code must DECIDE what to do. An `if` statement runs code only when something is true.',
    vi: 'Sss… một con creeper đang đến gần! Code của bạn phải QUYẾT ĐỊNH làm gì. Câu lệnh `if` chỉ chạy code khi điều gì đó là đúng.',
  },
  steps: [
    {
      text: {
        en: 'A variable named `creeperNearby` is already set to `true` at the top of the script. It means a creeper is close.',
        vi: 'Một variable tên `creeperNearby` đã được đặt sẵn là `true` ở đầu script. Nó nghĩa là có creeper ở gần.',
      },
    },
    {
      text: {
        en: "Write an `if` that checks `creeperNearby`. When it is true, `console.log` exactly: Run away!",
        vi: 'Viết một câu `if` kiểm tra `creeperNearby`. Khi nó là true, hãy `console.log` đúng dòng: Run away!',
      },
      hint: {
        en: "It looks like this:\n```\nif (creeperNearby) {\n  console.log('Run away!');\n}\n```",
        vi: "Nó trông như thế này:\n```\nif (creeperNearby) {\n  console.log('Run away!');\n}\n```",
      },
    },
  ],
  starterCode:
    '<h1>Danger Zone</h1>\n\n<script>\n  let creeperNearby = true;\n\n  // 💥 Write an if: if the creeper is near, warn the player\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: 'if',
      failMessage: {
        en: "I don't see an `if` yet. Start with `if (creeperNearby) { ... }` to make a decision.",
        vi: 'Mình chưa thấy câu `if` nào. Bắt đầu bằng `if (creeperNearby) { ... }` để ra quyết định nhé.',
      },
    },
    {
      type: 'consoleIncludes',
      value: 'Run away!',
      failMessage: {
        en: "The console should warn Run away! Inside your `if`, write `console.log('Run away!');`",
        vi: "Console cần cảnh báo Run away! Bên trong `if`, hãy viết `console.log('Run away!');` nhé",
      },
    },
  ],
  reflect: {
    question: { en: 'Imagine `creeperNearby` was `false` instead of `true`. Would Run away! still print?', vi: 'Hãy tưởng tượng `creeperNearby` là `false` thay vì `true`. Run away! có còn được in ra không?' },
    answer: { en: 'No. An `if` only runs the code in its `{ }` when the check is `true`. If `creeperNearby` is `false`, JavaScript skips the whole block and prints nothing.', vi: 'Không. Câu `if` chỉ chạy code trong `{ }` khi điều kiện là `true`. Nếu `creeperNearby` là `false`, JavaScript bỏ qua cả khối đó và không in gì cả.' },
  },
};
