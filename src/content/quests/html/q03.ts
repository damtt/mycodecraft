import type { Quest } from '../../../lib/types';

export const q03: Quest = {
  id: 'html-03',
  world: 'html',
  xp: 50,
  badge: 'b-book',
  title: { en: 'Story Pages', vi: 'Trang truyện' },
  story: {
    en: 'The village librarian wants to write a story in her book. A story needs more than one paragraph to tell what happens!',
    vi: 'Cô thủ thư trong làng muốn viết một câu chuyện vào quyển sách. Một câu chuyện cần nhiều hơn một đoạn văn để kể chuyện gì xảy ra!',
  },
  steps: [
    {
      text: {
        en: 'Remember the <p> tag for a paragraph? Write your first paragraph telling the start of a story.',
        vi: 'Còn nhớ tag <p> dùng cho đoạn văn không? Hãy viết đoạn văn đầu tiên kể phần mở đầu của câu chuyện.',
      },
      hint: {
        en: 'A paragraph looks like this: <p>Once upon a time...</p>',
        vi: 'Một đoạn văn trông như thế này: <p>Ngày xửa ngày xưa...</p>',
      },
    },
    {
      text: {
        en: 'Now add a second <p> below the first one. Each idea gets its own paragraph, so the page has at least 2.',
        vi: 'Bây giờ thêm một <p> thứ hai bên dưới cái đầu tiên. Mỗi ý có một đoạn văn riêng, nên trang có ít nhất 2 đoạn.',
      },
      hint: {
        en: 'Stack them up:\n<p>The hero set off.</p>\n<p>Then came a creeper, sss...</p>',
        vi: 'Xếp chúng lên nhau:\n<p>Người hùng lên đường.</p>\n<p>Rồi một con creeper xuất hiện, sss...</p>',
      },
    },
  ],
  starterCode: '<!-- ⛏️ Write two paragraphs below this line! -->\n',
  checks: [
    {
      type: 'elementCount',
      selector: 'p',
      min: 2,
      failMessage: {
        en: "A story needs at least 2 paragraphs. Add another <p>...</p> below the first one!",
        vi: 'Một câu chuyện cần ít nhất 2 đoạn văn. Thêm một <p>...</p> nữa bên dưới đoạn đầu tiên nhé!',
      },
    },
  ],
};
