import type { Quest } from '../../../lib/types';

export const q01: Quest = {
  id: 'html-01',
  world: 'html',
  xp: 50,
  badge: 'b-wood',
  title: { en: 'Hello, World!', vi: 'Xin chào, Thế giới!' },
  story: {
    en: 'A villager wants to greet travelers, but the welcome sign is blank! Write your first HTML to fill it.',
    vi: 'Một dân làng muốn chào du khách, nhưng tấm biển chào mừng đang trống trơn! Hãy viết dòng HTML đầu tiên để điền vào nhé.',
  },
  steps: [
    {
      text: {
        en: 'HTML is written in tags. A tag is a word inside angle brackets, like `<p>`. Find the comment in the editor.',
        vi: 'HTML được viết bằng các tag. Tag là một từ nằm trong dấu ngoặc nhọn, ví dụ `<p>`. Hãy tìm dòng ghi chú trong trình soạn thảo.',
      },
    },
    {
      text: {
        en: 'Write a paragraph that says Hello, world! using the `<p>` tag.',
        vi: 'Viết một đoạn văn nói Hello, world! bằng tag `<p>`.',
      },
      hint: {
        en: 'A paragraph looks like this: `<p>Hello, world!</p>` — the second tag with the / closes it.',
        vi: 'Một đoạn văn trông như thế này: `<p>Hello, world!</p>` — tag thứ hai có dấu / để đóng lại.',
      },
    },
  ],
  starterCode: '<!-- ⛏️ Type your code below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'p',
      failMessage: {
        en: "Hmm, I don't see a `<p>` tag yet. Paragraphs start with `<p>` and end with `</p>`!",
        vi: 'Hmm, mình chưa thấy tag `<p>` nào. Đoạn văn bắt đầu bằng `<p>` và kết thúc bằng `</p>` nhé!',
      },
    },
    {
      type: 'textIncludes',
      selector: 'p',
      value: 'hello',
      failMessage: {
        en: 'Your paragraph is there, but it should say Hello, world!',
        vi: 'Đoạn văn có rồi, nhưng nó cần nói Hello, world!',
      },
    },
  ],
};
