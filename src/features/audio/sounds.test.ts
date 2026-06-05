import { vi } from 'vitest';
import { playSound, _resetAudioForTests } from './sounds';
import type { SoundName } from './sounds';
import { useSettings } from '../../stores/settingsStore';

function mockAudioContext() {
  const osc = {
    type: '', frequency: { value: 0 },
    connect: vi.fn().mockReturnThis(), start: vi.fn(), stop: vi.fn(),
  };
  const gain = {
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
  };
  const ctx = {
    currentTime: 0, destination: {},
    state: 'running' as AudioContextState,
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    resume: vi.fn(),
  };
  vi.stubGlobal('AudioContext', vi.fn(() => ctx));
  return { ctx, osc };
}

describe('playSound', () => {
  beforeEach(() => {
    _resetAudioForTests();
    useSettings.setState({ soundOn: true });
  });

  afterEach(() => vi.unstubAllGlobals());

  test('plays notes when sound is on', () => {
    const { ctx, osc } = mockAudioContext();
    playSound('success');
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
    expect(osc.start).toHaveBeenCalledTimes(3);
  });

  test('silent when sound is off', () => {
    const { ctx } = mockAudioContext();
    useSettings.setState({ soundOn: false });
    playSound('success');
    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  test('never throws when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => playSound('levelup')).not.toThrow();
  });

  test('every SoundName has a tune', () => {
    const names: SoundName[] = ['pop', 'success', 'levelup', 'badge'];
    for (const n of names) {
      const { ctx } = mockAudioContext();
      playSound(n);
      expect(ctx.createOscillator).toHaveBeenCalled();
      _resetAudioForTests();
    }
  });
});
