import type { Quest } from '../../../lib/types';

export const q03: Quest = {
  id: 'css-03',
  world: 'css',
  xp: 50,
  badge: 'b-blue-dye',
  title: { en: 'Paint the Sky', vi: 'Tô màu bầu trời' },
  story: {
    en: 'You crafted blue dye from a deep cave flower! Paint the whole page like a bright morning sky.',
    vi: 'Bạn chế ra thuốc nhuộm xanh từ một bông hoa trong hang sâu! Hãy tô cả trang như bầu trời sáng sớm.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag at the top of the editor.',
        vi: 'Tìm tag `<style>` ở đầu trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Paint the whole page sky blue: select `body` and set `background-color` to `skyblue`. `body` means the whole page.',
        vi: 'Tô cả trang màu xanh trời: chọn `body` và đặt `background-color` thành `skyblue`. `body` nghĩa là toàn bộ trang.',
      },
      hint: {
        en: "It looks like this:\n```\nbody {\n  background-color: skyblue;\n}\n```",
        vi: "Nó trông như thế này:\n```\nbody {\n  background-color: skyblue;\n}\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🔵 Your CSS goes here */\n\n</style>\n\n<h1>Up on the Surface</h1>\n<p>The sky is so big after the caves!</p>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: 'body',
      prop: 'background-color',
      equalsAny: ['skyblue', 'rgb(135, 206, 235)'],
      failMessage: {
        en: 'The page is still plain. Inside `<style>`, write: `body { background-color: skyblue; }`',
        vi: 'Trang vẫn còn trống trơn. Bên trong `<style>`, hãy viết: `body { background-color: skyblue; }`',
      },
    },
  ],
  reflect: {
    question: { en: 'You painted the `body`, yet the heading and paragraph words are still their old color. Why did the text not turn blue too?', vi: 'Bạn đã tô `body`, vậy mà chữ của tiêu đề và đoạn văn vẫn giữ màu cũ. Vì sao chữ không chuyển sang xanh luôn?' },
    answer: { en: '`background-color` only paints the surface behind everything. The words are drawn with `color`, which you never changed, so they keep their own color on top of the new sky.', vi: '`background-color` chỉ tô phần nền phía sau mọi thứ. Chữ được vẽ bằng `color`, mà bạn chưa hề đổi, nên chúng vẫn giữ màu riêng nằm trên nền trời mới.' },
  },
};
