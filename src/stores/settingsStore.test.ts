import { useSettings } from './settingsStore';
import { migrateSettings } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => useSettings.setState({ lang: 'en', soundOn: true, fontScale: 'md', guideOn: true }));

  test('toggleSound flips and persists only data', () => {
    useSettings.getState().toggleSound();
    expect(useSettings.getState().soundOn).toBe(false);
    const raw = JSON.parse(localStorage.getItem('codecraft:settings')!);
    expect(raw.state).toEqual({ lang: 'en', soundOn: false, fontScale: 'md', guideOn: true });
    expect(raw.version).toBe(2);
  });

  test('setLang updates language', () => {
    useSettings.getState().setLang('vi');
    expect(useSettings.getState().lang).toBe('vi');
  });

  test('setFontScale updates and persists font scale', () => {
    useSettings.getState().setFontScale('lg');
    expect(useSettings.getState().fontScale).toBe('lg');
    const raw = JSON.parse(localStorage.getItem('codecraft:settings')!);
    expect(raw.state.fontScale).toBe('lg');
  });
});

describe('guideOn setting', () => {
  test('defaults to true', () => {
    // Re-read default from a fresh selector call
    expect(useSettings.getState().guideOn).toBe(true);
  });

  test('toggleGuide flips it', () => {
    useSettings.setState({ guideOn: true });
    useSettings.getState().toggleGuide();
    expect(useSettings.getState().guideOn).toBe(false);
  });

  test('migrate adds guideOn:true to v1 payloads without it', () => {
    const migrated = migrateSettings({ lang: 'vi', soundOn: false, fontScale: 'lg' }, 1);
    expect(migrated.guideOn).toBe(true);
    expect(migrated.lang).toBe('vi');
  });

  test('migrate preserves an existing guideOn', () => {
    const migrated = migrateSettings({ guideOn: false }, 1);
    expect(migrated.guideOn).toBe(false);
  });
});
