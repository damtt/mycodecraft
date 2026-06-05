import type { Quest } from '../../../lib/types';

export const q09: Quest = {
  id: 'js-09',
  world: 'js',
  xp: 75,
  badge: 'b-dice',
  title: { en: 'Lucky Drops', vi: 'May mắn rơi đồ' },
  story: {
    en: 'When you defeat a mob, the loot is a surprise! `Math.random` gives your code a lucky, unpredictable number — like rolling a dice.',
    vi: 'Khi bạn hạ một con quái, chiến lợi phẩm là một điều bất ngờ! `Math.random` cho code của bạn một con số may mắn khó đoán — như tung xúc xắc vậy.',
  },
  steps: [
    {
      text: {
        en: '`Math.random` gives a random number from 0 up to (but not including) 1. Multiply it by 6 to spread it across six sides.',
        vi: '`Math.random` cho một số ngẫu nhiên từ 0 đến gần 1 (không tính 1). Nhân nó với 6 để trải ra sáu mặt.',
      },
      hint: {
        en: 'Start with: `Math.random() * 6`',
        vi: 'Bắt đầu với: `Math.random() * 6`',
      },
    },
    {
      text: {
        en: 'Use `Math.floor` to chop off the decimals, then add 1 so the dice rolls 1 to 6. Save it in a variable and `console.log` it.',
        vi: 'Dùng `Math.floor` để cắt bỏ phần thập phân, rồi cộng thêm 1 để xúc xắc ra số từ 1 đến 6. Lưu vào một variable rồi `console.log` nó.',
      },
      hint: {
        en: "Put it together:\n```\nlet roll = Math.floor(Math.random() * 6) + 1;\nconsole.log(roll);\n```",
        vi: "Ghép lại:\n```\nlet roll = Math.floor(Math.random() * 6) + 1;\nconsole.log(roll);\n```",
      },
    },
  ],
  starterCode:
    '<h1>Loot Roller</h1>\n\n<script>\n  // 🎲 Roll a dice from 1 to 6 and log it\n\n</script>\n',
  checks: [
    {
      type: 'codeIncludes',
      value: 'Math.random',
      failMessage: {
        en: "I don't see `Math.random` yet. Use `Math.random()` to get a lucky number.",
        vi: 'Mình chưa thấy `Math.random`. Dùng `Math.random()` để lấy một con số may mắn nhé.',
      },
    },
    {
      type: 'codeIncludes',
      value: 'Math.floor',
      failMessage: {
        en: "I don't see `Math.floor` yet. Wrap your dice in `Math.floor(Math.random() * 6) + 1` to make a whole number.",
        vi: 'Mình chưa thấy `Math.floor`. Bọc xúc xắc trong `Math.floor(Math.random() * 6) + 1` để ra số nguyên nhé.',
      },
    },
  ],
};
