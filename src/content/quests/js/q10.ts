import type { Quest } from '../../../lib/types';

export const q10: Quest = {
  id: 'js-10',
  world: 'js',
  xp: 100,
  badge: 'b-trophy',
  title: { en: 'BOSS: Clicker Game', vi: 'TRÙM: Trò chơi bấm nút' },
  story: {
    en: 'The final challenge! Build a mining clicker: every click on the Mine button digs one more block and the score climbs. Use everything you have learned.',
    vi: 'Thử thách cuối cùng! Hãy xây một trò chơi bấm đào: mỗi cú click vào nút Mine sẽ đào thêm một khối và điểm số tăng lên. Dùng tất cả những gì bạn đã học.',
  },
  steps: [
    {
      text: {
        en: 'The page has a <button id="mine">Mine!</button> and a <span id="score">0</span>. Grab both with document.getElementById.',
        vi: 'Trang có một <button id="mine">Mine!</button> và một <span id="score">0</span>. Hãy lấy cả hai bằng document.getElementById.',
      },
      hint: {
        en: "let mine = document.getElementById('mine');\nlet scoreEl = document.getElementById('score');",
        vi: "let mine = document.getElementById('mine');\nlet scoreEl = document.getElementById('score');",
      },
    },
    {
      text: {
        en: 'Make a variable with let to remember the score. Start it at 0.',
        vi: 'Tạo một variable bằng let để nhớ điểm số. Bắt đầu từ 0.',
      },
      hint: {
        en: 'let score = 0;',
        vi: 'let score = 0;',
      },
    },
    {
      text: {
        en: "Use addEventListener to wait for a 'click' on the Mine button.",
        vi: "Dùng addEventListener để chờ một cú 'click' trên nút Mine.",
      },
      hint: {
        en: "mine.addEventListener('click', function () {\n  // runs on every click\n});",
        vi: "mine.addEventListener('click', function () {\n  // chạy mỗi lần click\n});",
      },
    },
    {
      text: {
        en: 'Inside the click, add 1 to score, then show it by setting scoreEl.textContent to score. Click the button and watch the number grow!',
        vi: 'Bên trong cú click, cộng 1 vào score, rồi hiển thị nó bằng cách đặt scoreEl.textContent bằng score. Bấm nút và xem con số lớn dần!',
      },
      hint: {
        en: 'score = score + 1;\nscoreEl.textContent = score;',
        vi: 'score = score + 1;\nscoreEl.textContent = score;',
      },
    },
  ],
  starterCode:
    '<h1>Mining Clicker</h1>\n<button id="mine">Mine!</button>\n<p>Blocks mined: <span id="score">0</span></p>\n\n<script>\n  // 🏆 Grab the button and score, count clicks, show the new score\n\n</script>\n',
  checks: [
    {
      type: 'elementExists',
      selector: 'button',
      failMessage: {
        en: "I can't find the Mine button. Keep <button id=\"mine\">Mine!</button> on the page.",
        vi: 'Mình không tìm thấy nút Mine. Hãy giữ <button id="mine">Mine!</button> trên trang.',
      },
    },
    {
      type: 'elementExists',
      selector: '#score',
      failMessage: {
        en: "I can't find the score. Keep <span id=\"score\">0</span> on the page.",
        vi: 'Mình không tìm thấy điểm số. Hãy giữ <span id="score">0</span> trên trang.',
      },
    },
    {
      type: 'codeIncludes',
      value: 'addEventListener',
      failMessage: {
        en: "I don't see addEventListener yet. Use mine.addEventListener('click', ...) to react to clicks.",
        vi: "Mình chưa thấy addEventListener. Dùng mine.addEventListener('click', ...) để phản ứng với click nhé.",
      },
    },
    {
      type: 'codeIncludes',
      value: 'score',
      failMessage: {
        en: 'I don\'t see a score yet. Make a let score = 0; and add 1 to it on every click.',
        vi: 'Mình chưa thấy score nào. Tạo let score = 0; và cộng thêm 1 cho nó mỗi lần click nhé.',
      },
    },
  ],
};
