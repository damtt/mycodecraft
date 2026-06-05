import type { Quest } from '../../../lib/types';

export const q07: Quest = {
  id: 'js-07',
  world: 'js',
  xp: 75,
  badge: 'b-piston',
  title: { en: 'Piston Power', vi: 'Sức mạnh Pít-tông' },
  story: {
    en: 'A piston pushes blocks to change the world. Your code can push new words onto the page by changing an element\'s text!',
    vi: 'Một pít-tông đẩy các khối để thay đổi thế giới. Code của bạn có thể đẩy chữ mới lên trang bằng cách thay đổi văn bản của một phần tử!',
  },
  steps: [
    {
      text: {
        en: 'There is a `<p id="status">` on the page that says Idle. Grab it with `document.getElementById` using its id, `status`.',
        vi: 'Trên trang có một `<p id="status">` ghi Idle. Hãy lấy nó bằng `document.getElementById` với id của nó là `status`.',
      },
      hint: {
        en: "Save it in a variable: `let status = document.getElementById('status');`",
        vi: "Lưu nó vào một variable: `let status = document.getElementById('status');`",
      },
    },
    {
      text: {
        en: "Change its words with `textContent` so the page now reads exactly: Mining...",
        vi: 'Thay đổi chữ của nó bằng `textContent` để trang giờ hiện đúng dòng: Mining...',
      },
      hint: {
        en: "Set the new text: `status.textContent = 'Mining...';`",
        vi: "Đặt văn bản mới: `status.textContent = 'Mining...';`",
      },
    },
  ],
  starterCode:
    '<h1>Piston Station</h1>\n<p id="status">Idle</p>\n\n<script>\n  // ⚙️ Find the status and push new words onto it\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: 'getElementById',
      failMessage: {
        en: "I don't see `getElementById` yet. Grab the paragraph with `document.getElementById('status')`.",
        vi: "Mình chưa thấy `getElementById`. Lấy đoạn văn bằng `document.getElementById('status')` nhé.",
      },
    },
    {
      type: 'textIncludes',
      selector: '#status',
      value: 'Mining...',
      failMessage: {
        en: "The status should read Mining... Set it with `status.textContent = 'Mining...';`",
        vi: "Status cần hiện Mining... Đặt nó bằng `status.textContent = 'Mining...';` nhé",
      },
    },
  ],
};
