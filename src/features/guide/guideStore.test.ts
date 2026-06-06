import { useGuide } from './guideStore';

beforeEach(() => {
  useGuide.setState({ bubble: null, greeted: new Set(), questCtx: null, editorFocused: false });
});

describe('guideStore', () => {
  test('say sets the bubble; dismiss clears it', () => {
    useGuide.getState().say({ en: 'hi', vi: 'chào' });
    expect(useGuide.getState().bubble).toEqual({ en: 'hi', vi: 'chào' });
    useGuide.getState().dismiss();
    expect(useGuide.getState().bubble).toBeNull();
  });

  test('greeted tracking is per key', () => {
    expect(useGuide.getState().hasGreeted('map')).toBe(false);
    useGuide.getState().markGreeted('map');
    expect(useGuide.getState().hasGreeted('map')).toBe(true);
    expect(useGuide.getState().hasGreeted('quest')).toBe(false);
  });

  test('editorFocused flag toggles', () => {
    useGuide.getState().setEditorFocused(true);
    expect(useGuide.getState().editorFocused).toBe(true);
  });
});
