import type { Quest } from '../../../lib/types';

export const q02: Quest = {
  id: 'css-02',
  world: 'css',
  xp: 50,
  badge: 'b-feather',
  title: { en: 'Fancy Lettering', vi: 'Chữ điệu đà' },
  story: {
    en: 'A feather lets you write fancy! Make your words bigger and line them up neatly with CSS.',
    vi: 'Một chiếc lông vũ giúp bạn viết thật điệu đà! Hãy làm chữ to hơn và xếp chúng cho gọn gàng bằng CSS.',
  },
  steps: [
    {
      text: {
        en: 'Find the <style> tag at the top — that is where every rule goes.',
        vi: 'Tìm tag <style> ở trên cùng — đó là nơi mọi quy tắc nằm.',
      },
    },
    {
      text: {
        en: 'Make the paragraph bigger: select p and set font-size to 32px. font-size means how tall the letters are.',
        vi: 'Làm đoạn văn to hơn: chọn p và đặt font-size thành 32px. font-size nghĩa là chữ cao bao nhiêu.',
      },
      hint: {
        en: 'It looks like this:\np {\n  font-size: 32px;\n}',
        vi: 'Nó trông như thế này:\np {\n  font-size: 32px;\n}',
      },
    },
    {
      text: {
        en: 'Now center the heading: select h1 and set text-align to center. text-align means which side the text sits on.',
        vi: 'Giờ căn giữa tiêu đề: chọn h1 và đặt text-align thành center. text-align nghĩa là chữ nằm ở phía nào.',
      },
      hint: {
        en: 'It looks like this:\nh1 {\n  text-align: center;\n}',
        vi: 'Nó trông như thế này:\nh1 {\n  text-align: center;\n}',
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🪶 Your CSS goes here */\n\n</style>\n\n<h1>My Cave Diary</h1>\n<p>Today I mined ten blocks of coal.</p>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: 'p',
      prop: 'font-size',
      equalsAny: ['32px'],
      failMessage: {
        en: 'The paragraph is still small. Inside <style>, write: p { font-size: 32px; }',
        vi: 'Đoạn văn vẫn còn nhỏ. Bên trong <style>, hãy viết: p { font-size: 32px; }',
      },
    },
    {
      type: 'computedStyle',
      selector: 'h1',
      prop: 'text-align',
      equalsAny: ['center'],
      failMessage: {
        en: "The heading isn't centered yet. Inside <style>, write: h1 { text-align: center; }",
        vi: 'Tiêu đề chưa được căn giữa. Bên trong <style>, hãy viết: h1 { text-align: center; }',
      },
    },
  ],
};
