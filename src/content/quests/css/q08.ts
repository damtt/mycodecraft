import type { Quest } from '../../../lib/types';

export const q08: Quest = {
  id: 'css-08',
  world: 'css',
  xp: 75,
  badge: 'b-beacon',
  title: { en: 'Beacon Beam', vi: 'Tia hải đăng' },
  story: {
    en: 'A beacon shoots its beam straight from the middle. Use flex to park the star dead center of the box.',
    vi: 'Một hải đăng bắn tia thẳng từ chính giữa. Dùng flex để đặt ngôi sao vào ngay trung tâm cái hộp.',
  },
  steps: [
    {
      text: {
        en: 'Find the `<style>` tag. The box already has class `center` and `display: flex` is the first step.',
        vi: 'Tìm tag `<style>`. Cái hộp đã có class `center` và `display: flex` là bước đầu tiên.',
      },
    },
    {
      text: {
        en: 'Turn on flex first: select `.center` and set `display` to `flex` so the next two lines work.',
        vi: 'Bật flex trước: chọn `.center` và đặt `display` thành `flex` để hai dòng tiếp theo hoạt động.',
      },
      hint: {
        en: "Start the rule like this:\n```\n.center {\n  display: flex;\n}\n```",
        vi: "Bắt đầu quy tắc như thế này:\n```\n.center {\n  display: flex;\n}\n```",
      },
    },
    {
      text: {
        en: 'Center left-to-right: in the `.center` rule set `justify-content` to `center`. It centers items across the row.',
        vi: 'Căn giữa theo chiều ngang: trong quy tắc `.center` đặt `justify-content` thành `center`. Nó căn giữa các món theo hàng.',
      },
      hint: {
        en: "Add this line inside the rule:\n```\n  justify-content: center;\n```",
        vi: "Thêm dòng này vào trong quy tắc:\n```\n  justify-content: center;\n```",
      },
    },
    {
      text: {
        en: 'Center top-to-bottom: in the `.center` rule set `align-items` to `center`. It centers items up and down.',
        vi: 'Căn giữa theo chiều dọc: trong quy tắc `.center` đặt `align-items` thành `center`. Nó căn giữa các món theo chiều trên dưới.',
      },
      hint: {
        en: "Add this line inside the rule:\n```\n  align-items: center;\n```",
        vi: "Thêm dòng này vào trong quy tắc:\n```\n  align-items: center;\n```",
      },
    },
  ],
  starterCode:
    '<style>\n  /* 🔆 Your CSS goes here */\n\n</style>\n\n<div class="center" style="height:100px"><span>★</span></div>\n',
  checks: [
    {
      type: 'computedStyle',
      selector: '.center',
      prop: 'justify-content',
      equalsAny: ['center'],
      failMessage: {
        en: 'The star is not centered across yet. In the `.center` rule, add: `justify-content: center;`',
        vi: 'Ngôi sao chưa được căn giữa theo chiều ngang. Trong quy tắc `.center`, thêm: `justify-content: center;`',
      },
    },
    {
      type: 'computedStyle',
      selector: '.center',
      prop: 'align-items',
      equalsAny: ['center'],
      failMessage: {
        en: 'The star is not centered up and down yet. In the `.center` rule, add: `align-items: center;`',
        vi: 'Ngôi sao chưa được căn giữa theo chiều dọc. Trong quy tắc `.center`, thêm: `align-items: center;`',
      },
    },
  ],
};
