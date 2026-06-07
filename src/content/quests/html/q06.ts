import type { Quest } from '../../../lib/types';

export const q06: Quest = {
  id: 'html-06',
  world: 'html',
  xp: 75,
  badge: 'b-painting',
  title: { en: 'Hang a Painting', vi: 'Treo một bức tranh' },
  story: {
    en: 'Your stone walls look so empty! Hang a painting to make your base feel like home.',
    vi: 'Mấy bức tường đá của bạn trống trải quá! Hãy treo một bức tranh để căn cứ trở nên ấm cúng như ở nhà.',
  },
  steps: [
    {
      text: {
        en: 'A picture uses the `<img>` tag. It has no closing tag — it stands alone. Add an `<img>` below the comment.',
        vi: 'Một bức ảnh dùng tag `<img>`. Nó không có tag đóng — nó đứng một mình. Thêm một `<img>` bên dưới dòng ghi chú.',
      },
      hint: {
        en: 'An image tag looks like this: `<img>`',
        vi: 'Một tag ảnh trông như thế này: `<img>`',
      },
    },
    {
      text: {
        en: 'An image needs a `src` to know which picture to show. Use `src="https://picsum.photos/200"` — that is the painting we will hang.',
        vi: 'Một bức ảnh cần một `src` để biết hiển thị tranh nào. Dùng `src="https://picsum.photos/200"` — đó là bức tranh chúng ta sẽ treo.',
      },
      hint: {
        en: "Add the picture address:\n```\n<img src=\"https://picsum.photos/200\">\n```",
        vi: "Thêm địa chỉ bức ảnh:\n```\n<img src=\"https://picsum.photos/200\">\n```",
      },
    },
    {
      text: {
        en: 'Add an `alt` too. `alt` is words that describe the picture, so a friend who cannot see it still knows what it is.',
        vi: 'Thêm một `alt` nữa nhé. `alt` là dòng chữ mô tả bức ảnh, để bạn nào không nhìn thấy ảnh vẫn biết đó là gì.',
      },
      hint: {
        en: "Describe your picture:\n```\n<img src=\"https://picsum.photos/200\" alt=\"A painting on my wall\">\n```",
        vi: "Mô tả bức ảnh của bạn:\n```\n<img src=\"https://picsum.photos/200\" alt=\"Một bức tranh trên tường\">\n```",
      },
    },
  ],
  starterCode: '<!-- ⛏️ Hang your painting below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'img',
      failMessage: {
        en: "I don't see a painting yet. A picture uses the `<img>` tag — try adding one!",
        vi: 'Mình chưa thấy bức tranh nào. Một bức ảnh dùng tag `<img>` — thử thêm một cái nhé!',
      },
    },
    {
      type: 'elementExists',
      selector: 'img[alt]',
      failMessage: {
        en: 'Your painting has no `alt` yet. Add `alt="..."` so everyone knows what the picture shows!',
        vi: 'Bức tranh chưa có `alt`. Thêm `alt="..."` để ai cũng biết bức ảnh vẽ gì nhé!',
      },
    },
  ],
  predict: {
    question: {
      en: 'If the picture ever fails to load, what does the `alt` text do?',
      vi: 'Nếu bức ảnh không tải lên được, dòng chữ `alt` sẽ làm gì?',
    },
    options: [
      { text: { en: 'It shows up in place of the picture', vi: 'Nó hiện ra thay cho bức ảnh' }, correct: true },
      { text: { en: 'It stays completely hidden', vi: 'Nó vẫn ẩn hoàn toàn' }, correct: false },
      { text: { en: 'The picture loads anyway after a moment', vi: 'Bức ảnh vẫn tự tải lên sau một lúc' }, correct: false },
    ],
    explain: {
      en: 'The `alt` is a backup description. If the picture cannot show, the browser displays the `alt` words instead — and a screen reader can read them aloud for friends who cannot see the image.',
      vi: '`alt` là lời mô tả dự phòng. Nếu ảnh không hiện được, trình duyệt sẽ hiển thị dòng chữ `alt` thay vào — và phần mềm đọc màn hình có thể đọc to lên cho bạn nào không nhìn thấy ảnh.',
    },
  },
};
