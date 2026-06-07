import type { Quest } from '../../../lib/types';

export const q05: Quest = {
  id: 'html-05',
  world: 'html',
  xp: 75,
  badge: 'b-compass',
  title: { en: 'Portal Links', vi: 'Cổng dịch chuyển' },
  story: {
    en: 'A link is like a portal — click it and you jump to a whole new place! Build a portal that takes friends to a cool website.',
    vi: 'Một đường link giống như một cái cổng dịch chuyển — bấm vào là bạn nhảy tới một nơi mới toanh! Hãy xây một cái cổng đưa bạn bè tới một trang web thú vị.',
  },
  steps: [
    {
      text: {
        en: 'A link uses the `<a>` tag. The words between `<a>` and `</a>` are the link text — what the player sees and clicks. Add an `<a>` with the link text Play Now.',
        vi: 'Một đường link dùng tag `<a>`. Chữ nằm giữa `<a>` và `</a>` được gọi là link text — phần người chơi nhìn thấy và bấm vào. Thêm một thẻ `<a>` hiển thị chữ Play Now.',
      },
      hint: {
        en: 'A link looks like this: `<a>Play Now</a>`',
        vi: 'Một đường link trông như thế này: `<a>Play Now</a>`',
      },
    },
    {
      text: {
        en: 'A link needs to know where to go. Give it an `href` that points to https://example.com — `href` is the portal address.',
        vi: 'Một đường link cần biết đi tới đâu. Hãy thêm thuộc tính `href` trỏ tới https://example.com — `href` chính là địa chỉ của cái cổng.',
      },
      hint: {
        en: "Add the address inside the tag:\n```\n<a href=\"https://example.com\">Play Now</a>\n```",
        vi: "Thêm địa chỉ vào trong tag:\n```\n<a href=\"https://example.com\">Play Now</a>\n```",
      },
    },
  ],
  starterCode:
    '<!-- ⛏️ Build your portal link below this line! -->\n<p>Click here to teleport:</p>\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'a',
      failMessage: {
        en: "I don't see a link yet. A link uses the `<a>` tag, like `<a>Play Now</a>`!",
        vi: 'Mình chưa thấy đường link nào. Một đường link dùng tag `<a>`, ví dụ `<a>Play Now</a>`!',
      },
    },
    {
      type: 'textNonEmpty',
      selector: 'a',
      failMessage: {
        en: 'Your link has no link text yet. Type the words the player will see and click between `<a>` and `</a>`, like `<a>Play Now</a>`.',
        vi: 'Đường link chưa có link text. Hãy gõ phần chữ người chơi nhìn thấy và bấm vào, đặt giữa `<a>` và `</a>`, ví dụ `<a>Play Now</a>`.',
      },
    },
    {
      type: 'attrMatches',
      selector: 'a',
      attr: 'href',
      // Any full web address: must start with http:// or https:// and have more after it.
      pattern: '^https?://.+',
      failMessage: {
        en: 'Your link needs a real web address. Set `href` to a full URL that starts with `http://` or `https://`, like `https://example.com`!',
        vi: 'Đường link cần một địa chỉ web thật. Đặt `href` thành một URL đầy đủ bắt đầu bằng `http://` hoặc `https://`, ví dụ `https://example.com`!',
      },
    },
  ],
  reflect: {
    question: {
      en: 'In `<a href="...">Play Now</a>`, which part is the *address* and which part is the *link text*?',
      vi: 'Trong `<a href="...">Play Now</a>`, phần nào là *địa chỉ* và phần nào là *link text*?',
    },
    answer: {
      en: 'The `href="..."` is the hidden address the portal jumps to; the link text between `<a>` and `</a>` is the glowing part the player sees and clicks.',
      vi: '`href="..."` là địa chỉ ẩn mà cái cổng nhảy tới; link text nằm giữa `<a>` và `</a>` là phần phát sáng mà người chơi nhìn thấy và bấm vào.',
    },
  },
};
