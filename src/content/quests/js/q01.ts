import type { Quest } from '../../../lib/types';

export const q01: Quest = {
  id: 'js-01',
  world: 'js',
  xp: 50,
  badge: 'b-torch',
  title: { en: 'First Spark', vi: 'Tia lửa đầu tiên' },
  story: {
    en: 'Sparkstone makes things DO stuff — and so does JavaScript! Light your first Sparkstone torch by printing a message.',
    vi: 'Sparkstone làm mọi thứ HOẠT ĐỘNG — JavaScript cũng vậy! Hãy thắp ngọn đuốc Sparkstone đầu tiên bằng cách in ra một thông điệp.',
  },
  steps: [
    {
      text: {
        en: 'JavaScript lives inside a `<script>` tag. Find it in the editor.',
        vi: 'JavaScript nằm trong tag `<script>`. Hãy tìm nó trong trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Use `console.log` to print exactly: Hello, miner!  Watch it appear in the Console panel below the preview.',
        vi: 'Dùng `console.log` để in ra đúng dòng: Hello, miner!  Xem nó hiện ra ở bảng Console bên dưới phần xem trước.',
      },
      hint: {
        en: "It looks like this: `console.log('Hello, miner!');`",
        vi: "Nó trông như thế này: `console.log('Hello, miner!');`",
      },
    },
  ],
  starterCode:
    '<h1>Sparkstone Lab</h1>\n\n<script>\n  // ⚡ Your JavaScript goes here\n\n</script>\n',
  checks: [
    {
      type: 'consoleIncludes',
      value: 'Hello, miner!',
      failMessage: {
        en: "I don't see Hello, miner! in the console yet. Try `console.log('Hello, miner!');`",
        vi: "Mình chưa thấy Hello, miner! trong console. Thử `console.log('Hello, miner!');` nhé",
      },
    },
  ],
  reflect: {
    question: { en: 'Your message printed in the Console. Did `console.log` change anything you can SEE on the page itself?', vi: 'Thông điệp của bạn in ra ở Console. `console.log` có thay đổi điều gì bạn NHÌN THẤY trên trang không?' },
    answer: { en: 'No — `console.log` only writes to the Console, a place for messages to the programmer. It does not change the page the player sees.', vi: 'Không — `console.log` chỉ ghi ra Console, nơi nhắn tin cho lập trình viên. Nó không thay đổi trang mà người chơi nhìn thấy.' },
  },
};
