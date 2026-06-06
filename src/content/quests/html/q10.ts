import type { Quest } from '../../../lib/types';

export const q10: Quest = {
  id: 'html-10',
  world: 'html',
  xp: 100,
  badge: 'b-grass',
  title: { en: 'BOSS: Fan Page', vi: 'TRÙM: Trang người hâm mộ' },
  story: {
    en: 'Boss quest! Build a whole fan page about your favorite thing, using every block you have learned in the Grasslands.',
    vi: 'Nhiệm vụ trùm! Hãy xây trọn một trang người hâm mộ về thứ bạn yêu thích, dùng mọi khối bạn đã học ở Đồng cỏ.',
  },
  steps: [
    {
      text: {
        en: 'Start with a big title. Add an `<h1>` at the top with the name of your favorite thing.',
        vi: 'Bắt đầu bằng một tiêu đề to. Thêm một `<h1>` ở trên cùng với tên thứ bạn yêu thích.',
      },
      hint: {
        en: 'A big title looks like this: `<h1>I love building</h1>`',
        vi: 'Một tiêu đề to trông như thế này: `<h1>I love building</h1>`',
      },
    },
    {
      text: {
        en: 'Write at least 2 paragraphs with the `<p>` tag, telling why you love it.',
        vi: 'Viết ít nhất 2 đoạn văn bằng tag `<p>`, kể vì sao bạn yêu thích nó.',
      },
      hint: {
        en: "Stack two paragraphs:\n```\n<p>It is so fun!</p>\n<p>I play every day.</p>\n```",
        vi: "Xếp hai đoạn văn:\n```\n<p>Nó vui lắm!</p>\n<p>Mình chơi mỗi ngày.</p>\n```",
      },
    },
    {
      text: {
        en: 'Hang a picture with `<img>`. Give it both a `src` and an `alt` that describes it.',
        vi: 'Treo một bức ảnh bằng `<img>`. Cho nó cả `src` và `alt` để mô tả ảnh.',
      },
      hint: {
        en: "Add the picture and its description:\n```\n<img src=\"https://picsum.photos/200\" alt=\"My favorite thing\">\n```",
        vi: "Thêm bức ảnh và lời mô tả:\n```\n<img src=\"https://picsum.photos/200\" alt=\"Thứ mình yêu thích\">\n```",
      },
    },
    {
      text: {
        en: 'Make a list of 3 cool facts. Use a `<ul>` with at least 3 `<li>` items inside.',
        vi: 'Làm một danh sách 3 điều thú vị. Dùng một `<ul>` với ít nhất 3 món `<li>` bên trong.',
      },
      hint: {
        en: "List your facts:\n```\n<ul>\n  <li>It has creepers, sss...</li>\n  <li>You can mine diamonds.</li>\n  <li>You can build anything.</li>\n</ul>\n```",
        vi: "Liệt kê các điều thú vị:\n```\n<ul>\n  <li>Có creeper, sss...</li>\n  <li>Bạn có thể đào kim cương.</li>\n  <li>Bạn có thể xây bất cứ thứ gì.</li>\n</ul>\n```",
      },
    },
    {
      text: {
        en: 'Finally, add a portal link with the `<a>` tag so fans can learn more somewhere else.',
        vi: 'Cuối cùng, thêm một cổng link bằng tag `<a>` để người hâm mộ tìm hiểu thêm ở nơi khác.',
      },
      hint: {
        en: "A link looks like this:\n```\n<a href=\"https://example.com\">Learn more</a>\n```",
        vi: "Một đường link trông như thế này:\n```\n<a href=\"https://example.com\">Tìm hiểu thêm</a>\n```",
      },
    },
    {
      text: {
        en: 'Look over your page — title, paragraphs, picture, list, and link. When it is all there, you beat the Grasslands boss!',
        vi: 'Xem lại trang của bạn — tiêu đề, đoạn văn, ảnh, danh sách và link. Khi đủ tất cả, bạn đã hạ trùm Đồng cỏ!',
      },
    },
  ],
  starterCode:
    '<!-- ⛏️ Build your fan page below! Use a title, paragraphs, an image, a list, and a link. -->\n<h2>My fan page</h2>\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'h1',
      failMessage: {
        en: "Every page needs a big title. Add an `<h1>` at the top!",
        vi: 'Mỗi trang cần một tiêu đề to. Thêm một `<h1>` ở trên cùng nhé!',
      },
    },
    {
      type: 'elementExists',
      selector: 'img[alt]',
      failMessage: {
        en: "I need a picture with a description. Add an `<img>` with an `alt=\"...\"`!",
        vi: 'Mình cần một bức ảnh có lời mô tả. Thêm một `<img>` với `alt="..."` nhé!',
      },
    },
    {
      type: 'elementCount',
      selector: 'li',
      min: 3,
      failMessage: {
        en: "Your facts list needs at least 3 items. Add more `<li>...</li>` inside the `<ul>`!",
        vi: 'Danh sách điều thú vị cần ít nhất 3 món. Thêm các `<li>...</li>` nữa vào trong `<ul>`!',
      },
    },
    {
      type: 'elementExists',
      selector: 'a',
      failMessage: {
        en: "Don't forget the portal link! Add an `<a>` tag so fans can click through.",
        vi: 'Đừng quên cổng link! Thêm một tag `<a>` để người hâm mộ bấm vào nhé.',
      },
    },
    {
      type: 'elementCount',
      selector: 'p',
      min: 2,
      failMessage: {
        en: "You need at least 2 paragraphs. Add another `<p>...</p>` telling more about it!",
        vi: 'Bạn cần ít nhất 2 đoạn văn. Thêm một `<p>...</p>` nữa kể thêm về nó nhé!',
      },
    },
  ],
};
