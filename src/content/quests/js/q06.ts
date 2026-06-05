import type { Quest } from '../../../lib/types';

export const q06: Quest = {
  id: 'js-06',
  world: 'js',
  xp: 75,
  badge: 'b-lever',
  title: { en: 'Pull the Lever', vi: 'Kéo cần gạt' },
  story: {
    en: 'A lever does nothing until someone pulls it. With `addEventListener`, your code can wait for a click and then spring into action!',
    vi: 'Một cần gạt chẳng làm gì cho đến khi có người kéo nó. Với `addEventListener`, code của bạn có thể chờ một cú click rồi bật vào hành động!',
  },
  steps: [
    {
      text: {
        en: 'A `<button>` that says Pull is already on the page. Grab it with `document.querySelector` so your code can listen to it.',
        vi: 'Một `<button>` ghi Pull đã có sẵn trên trang. Hãy lấy nó bằng `document.querySelector` để code có thể lắng nghe nó.',
      },
      hint: {
        en: "Save the button in a variable: `let lever = document.querySelector('button');`",
        vi: "Lưu nút vào một variable: `let lever = document.querySelector('button');`",
      },
    },
    {
      text: {
        en: "Use `addEventListener` to wait for a `'click'`. When the button is clicked, `console.log` a message like Lever pulled!",
        vi: "Dùng `addEventListener` để chờ một cú `'click'`. Khi nút được bấm, `console.log` một thông điệp như Lever pulled!",
      },
      hint: {
        en: "It looks like this:\n```\nlever.addEventListener('click', function () {\n  console.log('Lever pulled!');\n});\n```",
        vi: "Nó trông như thế này:\n```\nlever.addEventListener('click', function () {\n  console.log('Lever pulled!');\n});\n```",
      },
    },
  ],
  starterCode:
    '<h1>Redstone Switch</h1>\n<button>Pull</button>\n\n<script>\n  // 🎚️ Listen for a click on the button\n\n</script>\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'button',
      failMessage: {
        en: "I can't find the button. Keep the `<button>Pull</button>` on the page so your code can listen to it.",
        vi: 'Mình không tìm thấy nút. Hãy giữ `<button>Pull</button>` trên trang để code có thể lắng nghe nó.',
      },
    },
    {
      type: 'codeIncludes',
      value: 'addEventListener',
      failMessage: {
        en: "I don't see `addEventListener` yet. Use `lever.addEventListener('click', ...)` to wait for a click.",
        vi: "Mình chưa thấy `addEventListener`. Dùng `lever.addEventListener('click', ...)` để chờ một cú click nhé.",
      },
    },
  ],
};
