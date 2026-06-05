import type { Quest } from '../../../lib/types';

export const q07: Quest = {
  id: 'html-07',
  world: 'html',
  xp: 75,
  badge: 'b-button',
  title: { en: 'Buttons & Levers', vi: 'Nút bấm & Cần gạt' },
  story: {
    en: 'In Minecraft, buttons and levers make things happen. Let us build a control panel a player can actually click and type into!',
    vi: 'Trong Minecraft, nút bấm và cần gạt làm mọi thứ hoạt động. Hãy xây một bảng điều khiển mà người chơi có thể bấm và gõ chữ vào!',
  },
  steps: [
    {
      text: {
        en: 'A clickable button uses the <button> tag. The words inside it show on the button. Add one that says Press me.',
        vi: 'Một nút bấm được dùng tag <button>. Chữ bên trong sẽ hiện lên trên nút. Thêm một nút nói Press me.',
      },
      hint: {
        en: 'A button looks like this: <button>Press me</button>',
        vi: 'Một nút bấm trông như thế này: <button>Press me</button>',
      },
    },
    {
      text: {
        en: 'An <input> is a box where a player can type, like writing a name. It stands alone with no closing tag. Add one.',
        vi: 'Một <input> là một ô để người chơi gõ chữ vào, ví dụ viết tên. Nó đứng một mình, không có tag đóng. Thêm một cái.',
      },
      hint: {
        en: 'A typing box looks like this: <input>',
        vi: 'Một ô gõ chữ trông như thế này: <input>',
      },
    },
  ],
  starterCode: '<!-- ⛏️ Build your control panel below this line! -->\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'button',
      failMessage: {
        en: "I don't see a button yet. A button uses the <button> tag, like <button>Press me</button>!",
        vi: 'Mình chưa thấy nút bấm nào. Một nút bấm dùng tag <button>, ví dụ <button>Press me</button>!',
      },
    },
    {
      type: 'elementExists',
      selector: 'input',
      failMessage: {
        en: 'Now add a typing box. An <input> tag makes a box players can type into!',
        vi: 'Bây giờ thêm một ô gõ chữ. Tag <input> tạo một ô để người chơi gõ vào!',
      },
    },
  ],
};
