import { vi } from 'vitest';
import { playSound, _resetAudioForTests } from './sounds';
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

  test('plays notes when sound is on', () => {
    const { ctx, osc } = mockAudioContext();
    playSound('pop');
    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(osc.start).toHaveBeenCalled();
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
});
