import type { Quest } from '../../../lib/types';

export const q02: Quest = {
  id: 'html-02',
  world: 'html',
  xp: 50,
  badge: 'b-sign',
  title: { en: 'Big Signs', vi: 'Biển báo to' },
  story: {
    en: 'Travelers walk right past your tiny sign! You need big, bold signs that everyone can read from far away.',
    vi: 'Du khách đi lướt qua tấm biển bé xíu của bạn! Bạn cần những tấm biển to và rõ để ai ở xa cũng đọc được.',
  },
  steps: [
    {
      text: {
        en: 'A heading is a big title. The biggest one uses the <h1> tag. Add an <h1> above your paragraph that says Welcome!',
        vi: 'Heading là một tiêu đề to. Cái to nhất dùng tag <h1>. Hãy thêm một <h1> phía trên đoạn văn, nói Welcome!',
      },
      hint: {
        en: 'A big title looks like this: <h1>Welcome!</h1>',
        vi: 'Một tiêu đề to trông như thế này: <h1>Welcome!</h1>',
      },
    },
    {
      text: {
        en: 'Now add a smaller heading with the <h2> tag. h2 is a little smaller than h1, perfect for a second sign.',
        vi: 'Bây giờ thêm một heading nhỏ hơn bằng tag <h2>. h2 nhỏ hơn h1 một chút, hợp với tấm biển thứ hai.',
      },
      hint: {
        en: 'A smaller title looks like this: <h2>Come on in</h2>',
        vi: 'Một tiêu đề nhỏ hơn trông như thế này: <h2>Come on in</h2>',
      },
    },
  ],
  starterCode:
    '<!-- ⛏️ Add your headings above the paragraph! -->\n<p>This is my village.</p>\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'h1',
      failMessage: {
        en: "Hmm, I don't see an <h1> yet — big signs need a big title! Try <h1>Welcome!</h1>.",
        vi: 'Hmm, mình chưa thấy <h1> nào — biển to cần tiêu đề to! Thử <h1>Welcome!</h1> nhé.',
      },
    },
    {
      type: 'elementExists',
      selector: 'h2',
      failMessage: {
        en: "I found your <h1>, but the second sign is missing. Add an <h2> tag too!",
        vi: 'Mình thấy <h1> rồi, nhưng còn thiếu tấm biển thứ hai. Thêm một tag <h2> nữa nhé!',
      },
    },
  ],
};
