import { useSettings } from '../../stores/settingsStore';

export type SoundName = 'pop' | 'success' | 'levelup' | 'badge';

// [frequency Hz, startOffset s, duration s]
const TUNES: Record<SoundName, Array<[number, number, number]>> = {
  pop: [[440, 0, 0.08]],
  success: [[659, 0, 0.1], [784, 0.1, 0.1], [1047, 0.2, 0.18]],
  levelup: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.3]],
  badge: [[784, 0, 0.1], [1175, 0.1, 0.22]],
};

let ctx: AudioContext | null = null;

export function _resetAudioForTests(): void {
  ctx = null;
}

export function playSound(name: SoundName): void {
  if (!useSettings.getState().soundOn) return;
  try {
    if (!ctx) ctx = new AudioContext();
    void ctx.resume();
    const t0 = ctx.currentTime;
    for (const [freq, offset, dur] of TUNES[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, t0 + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + offset + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + offset);
      osc.stop(t0 + offset + dur);
    }
  } catch {
    // Audio is delight, never a crash.
  }
}
