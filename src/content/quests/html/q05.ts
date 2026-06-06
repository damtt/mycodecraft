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
        en: 'A link uses the `<a>` tag. The words between `<a>` and `</a>` are what you click. Add an `<a>` that says Play Now.',
        vi: 'Một đường link dùng tag `<a>`. Chữ nằm giữa `<a>` và `</a>` chính là phần bạn bấm vào. Thêm một `<a>` nói Play Now.',
      },
      hint: {
        en: 'A link looks like this: `<a>Play Now</a>`',
        vi: 'Một đường link trông như thế này: `<a>Play Now</a>`',
      },
    },
    {
      text: {
        en: 'A link needs to know where to go. Give it an `href` that points to https://example.com — `href` is the portal address.',
        vi: 'Một đường link cần biết đi tới đâu. Hãy cho nó một `href` trỏ tới https://example.com — `href` chính là địa chỉ của cái cổng.',
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
      type: 'attrEquals',
      selector: 'a',
      attr: 'href',
      value: 'https://example.com',
      failMessage: {
        en: 'Your link has no address yet. Set `href="https://example.com"` so the portal goes somewhere!',
        vi: 'Đường link chưa có địa chỉ. Đặt `href="https://example.com"` để cái cổng dẫn tới đâu đó nhé!',
      },
    },
  ],
};
