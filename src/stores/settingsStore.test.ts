import { useSettings } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => useSettings.setState({ lang: 'en', soundOn: true }));

  test('toggleSound flips and persists only data', () => {
    useSettings.getState().toggleSound();
    expect(useSettings.getState().soundOn).toBe(false);
    const raw = JSON.parse(localStorage.getItem('codecraft:settings')!);
    expect(raw.state).toEqual({ lang: 'en', soundOn: false });
    expect(raw.version).toBe(1);
  });

  test('setLang updates language', () => {
    useSettings.getState().setLang('vi');
    expect(useSettings.getState().lang).toBe('vi');
  });
});
