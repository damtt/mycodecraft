import type { Localized } from '../../lib/types';
import type { ScreenKey } from './guideStore';

type ByScreen = Record<ScreenKey, Localized>;

export const GUIDE: {
  greeting: ByScreen;
  screenHelp: ByScreen;
  idle: ByScreen;
  failedCheck: Localized;
  stuck: Localized;
  allHintsSeen: Localized;
} = {
  greeting: {
    map: { en: 'Pick a quest to start crafting! [icon:pickaxe]', vi: 'Chọn một nhiệm vụ để bắt đầu chế tạo nhé! [icon:pickaxe]' },
    quest: { en: 'Read the steps, write your code, then tap Check [icon:check]', vi: 'Đọc các bước, viết code, rồi bấm Kiểm tra [icon:check]' },
    inventory: { en: "Here are the badges you've earned. Awesome haul!", vi: 'Đây là các huy hiệu bạn đã kiếm được. Tuyệt quá!' },
    settings: { en: 'Change sound, language, and text size here.', vi: 'Đổi âm thanh, ngôn ngữ và cỡ chữ ở đây.' },
  },
  screenHelp: {
    map: { en: 'Tap a glowing quest to play it. Locked ones open as you level up!', vi: 'Bấm vào nhiệm vụ đang sáng để chơi. Nhiệm vụ bị khóa sẽ mở khi bạn lên cấp!' },
    quest: { en: 'Type code in the editor, watch it appear in Preview, then tap Check my code.', vi: 'Gõ code vào trình soạn thảo, xem nó hiện ra ở phần Xem trước, rồi bấm Kiểm tra code.' },
    inventory: { en: 'Every quest drops a badge. Try to collect them all!', vi: 'Mỗi nhiệm vụ tặng một huy hiệu. Hãy sưu tập hết nhé!' },
    settings: { en: 'Make the game feel just right for you here.', vi: 'Chỉnh cho trò chơi hợp với bạn nhất ở đây.' },
  },
  idle: {
    map: { en: 'Need a quest? The glowing one is next! [icon:pickaxe]', vi: 'Cần một nhiệm vụ? Cái đang sáng là tiếp theo đó! [icon:pickaxe]' },
    quest: { en: 'Stuck? Tap me for a hint anytime. [icon:bulb]', vi: 'Bí à? Bấm vào mình để xem gợi ý bất cứ lúc nào nhé. [icon:bulb]' },
    inventory: { en: 'Play more quests to fill your chest!', vi: 'Chơi thêm nhiệm vụ để lấp đầy rương nào!' },
    settings: { en: 'All set? Tap World Map to keep crafting.', vi: 'Xong chưa? Bấm Bản đồ để chế tạo tiếp nhé.' },
  },
  failedCheck: { en: 'So close! Check the steps again — tap me if you want a hint. [icon:bulb]', vi: 'Sắp đúng rồi! Xem lại các bước nhé — bấm vào mình nếu cần gợi ý. [icon:bulb]' },
  stuck: { en: 'Whoa, your code got stuck in a loop! Tap [icon:loop] to reset and try again.', vi: 'Ối, code của bạn bị kẹt trong vòng lặp! Bấm [icon:loop] để đặt lại và thử lại nhé.' },
  allHintsSeen: { en: "You've seen all the hints for this quest — you've got this! [icon:muscle]", vi: 'Bạn đã xem hết gợi ý của nhiệm vụ này rồi — cố lên nhé! [icon:muscle]' },
};
