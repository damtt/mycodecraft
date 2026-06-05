import { useSettings } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => useSettings.setState({ lang: 'en', soundOn: true, fontScale: 'md' }));

  test('toggleSound flips and persists only data', () => {
    useSettings.getState().toggleSound();
    expect(useSettings.getState().soundOn).toBe(false);
    const raw = JSON.parse(localStorage.getItem('codecraft:settings')!);
    expect(raw.state).toEqual({ lang: 'en', soundOn: false, fontScale: 'md' });
    expect(raw.version).toBe(1);
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
