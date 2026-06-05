import type { Quest } from '../../../lib/types';

export const q09: Quest = {
  id: 'html-09',
  world: 'html',
  xp: 75,
  badge: 'b-bricks',
  title: { en: 'Building Rooms', vi: 'Xây phòng' },
  story: {
    en: 'A big base needs rooms to keep things tidy. A <div> is like a room — it holds other tags together in one box.',
    vi: 'Một căn cứ lớn cần các phòng để mọi thứ gọn gàng. Một <div> giống như một căn phòng — nó gom các tag khác lại trong một cái hộp.',
  },
  steps: [
    {
      text: {
        en: 'A room uses the <div> tag. It is an invisible box that holds other tags. Add an empty <div></div>.',
        vi: 'Một căn phòng dùng tag <div>. Nó là một cái hộp vô hình chứa các tag khác. Thêm một <div></div> trống.',
      },
      hint: {
        en: 'An empty room looks like this:\n<div>\n</div>',
        vi: 'Một căn phòng trống trông như thế này:\n<div>\n</div>',
      },
    },
    {
      text: {
        en: 'Put an <h2> heading INSIDE the div — it becomes the room\'s sign. Tags inside a div are called its children.',
        vi: 'Bỏ một heading <h2> VÀO BÊN TRONG div — nó trở thành tấm biển của căn phòng. Các tag nằm trong div được gọi là con của nó.',
      },
      hint: {
        en: 'The heading goes inside the room:\n<div>\n  <h2>Bedroom</h2>\n</div>',
        vi: 'Tiêu đề nằm bên trong phòng:\n<div>\n  <h2>Bedroom</h2>\n</div>',
      },
    },
    {
      text: {
        en: 'Now add a <p> inside the same div, below the heading. The div now holds a heading and a paragraph together.',
        vi: 'Bây giờ thêm một <p> vào trong cùng cái div đó, dưới tiêu đề. Giờ div chứa cả tiêu đề và đoạn văn cùng nhau.',
      },
      hint: {
        en: 'Both tags live inside the room:\n<div>\n  <h2>Bedroom</h2>\n  <p>A cozy place to sleep.</p>\n</div>',
        vi: 'Cả hai tag đều nằm trong phòng:\n<div>\n  <h2>Bedroom</h2>\n  <p>Một chỗ ấm áp để ngủ.</p>\n</div>',
      },
    },
  ],
  starterCode: '<!-- ⛏️ Build your room below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'div > h2',
      failMessage: {
        en: "I need an <h2> sitting INSIDE a <div>. Put the <h2> between <div> and </div>!",
        vi: 'Mình cần một <h2> nằm BÊN TRONG một <div>. Đặt <h2> vào giữa <div> và </div> nhé!',
      },
    },
    {
      type: 'elementExists',
      selector: 'div > p',
      failMessage: {
        en: "Now add a <p> inside the same <div>, right after the heading!",
        vi: 'Bây giờ thêm một <p> vào trong cùng cái <div>, ngay sau tiêu đề!',
      },
    },
  ],
};
