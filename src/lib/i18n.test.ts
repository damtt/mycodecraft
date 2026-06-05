import { renderHook, act } from '@testing-library/react';
import { lt, useT } from './i18n';
import { useSettings } from '../stores/settingsStore';

describe('i18n', () => {
  beforeEach(() => useSettings.setState({ lang: 'en', soundOn: true }));

  test('lt picks language with EN fallback', () => {
    expect(lt({ en: 'Hello', vi: 'Xin chào' }, 'vi')).toBe('Xin chào');
    expect(lt({ en: 'Hello', vi: 'Xin chào' }, 'en')).toBe('Hello');
    expect(lt({ en: 'Hello', vi: '' }, 'vi')).toBe('Hello');
    expect(lt({ en: 'Hello', vi: '   ' }, 'vi')).toBe('Hello');
  });

  test('useT reacts to language switch', () => {
    const { result } = renderHook(() => useT());
    expect(result.current.t('pressStart')).toBe('Press Start');
    act(() => useSettings.getState().setLang('vi'));
    expect(result.current.t('pressStart')).toBe('Bắt đầu');
  });
});
