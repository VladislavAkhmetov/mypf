// Procedural and authentic game sound generator using Web Audio API
// Fully integrates with the global XP mute preference

import { getMuted } from "@/lib/xp/sound";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}


// ---------- 8-bit voices for the pixel minesweeper ----------
// NES-like channels: pulse waves with fixed duty cycles, a triangle bass and 1-bit noise.
// Volumes change in 1/60 s steps, the way the console's frame-based envelopes did.
const FRAME = 1 / 60;
const pulseWaves = new Map<number, PeriodicWave>();

function pulseWave(ctx: AudioContext, duty: number): PeriodicWave {
  const cached = pulseWaves.get(duty);
  if (cached) return cached;
  const harmonics = 32;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  for (let n = 1; n < harmonics; n++) {
    real[n] = (2 / (n * Math.PI)) * Math.sin(2 * Math.PI * n * duty);
    imag[n] = (2 / (n * Math.PI)) * (1 - Math.cos(2 * Math.PI * n * duty));
  }
  const wave = ctx.createPeriodicWave(real, imag);
  pulseWaves.set(duty, wave);
  return wave;
}

function steppedEnvelope(gain: GainNode, start: number, duration: number, volume: number) {
  const steps = Math.max(1, Math.round(duration / FRAME));
  for (let i = 0; i < steps; i++) gain.gain.setValueAtTime(volume * (1 - i / steps), start + i * FRAME);
  gain.gain.setValueAtTime(0, start + duration);
}

function chip(
  ctx: AudioContext,
  { freq, start, duration, volume, duty = 0.25, slideTo, wave = "pulse" }:
  { freq: number; start: number; duration: number; volume: number; duty?: number; slideTo?: number; wave?: "pulse" | "triangle" },
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  if (wave === "triangle") osc.type = "triangle";
  else osc.setPeriodicWave(pulseWave(ctx, duty));
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) {
    // Stepped pitch slide, one change per frame.
    const steps = Math.max(1, Math.round(duration / FRAME));
    for (let i = 1; i <= steps; i++) osc.frequency.setValueAtTime(freq + ((slideTo - freq) * i) / steps, start + i * FRAME);
  }
  steppedEnvelope(gain, start, duration, volume);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise(ctx: AudioContext, { start, duration, volume, period = 2, periodTo }: { start: number; duration: number; volume: number; period?: number; periodTo?: number }) {
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let value = 1;
  let hold = 0;
  for (let i = 0; i < length; i++) {
    const progress = i / length;
    const currentPeriod = Math.round(period + ((periodTo ?? period) - period) * progress);
    if (hold-- <= 0) {
      value = Math.random() < 0.5 ? -1 : 1;
      hold = currentPeriod;
    }
    data[i] = value;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  steppedEnvelope(gain, start, duration, volume);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(start);
}

function play(render: (ctx: AudioContext, now: number) => void) {
  if (getMuted()) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    render(ctx, ctx.currentTime + 0.005);
  } catch {
    // Audio is optional.
  }
}

const NOTE = { G3: 196, C4: 261.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51 };

export const gameSound = {
  // Solitaire: Paper flutter / card sliding across felt
  cardSlide(vol = 0.25) {
    if (getMuted()) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Filtered noise for paper friction
      const bufferSize = ctx.sampleRate * 0.08; // 80ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
    } catch {
      // AudioContext fallback
    }
  },

  // Solitaire: Gentle card drop onto table/pile
  cardPlace(vol = 0.3) {
    if (getMuted()) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  },

  // Solitaire: Card flip
  cardFlip(vol = 0.28) {
    if (getMuted()) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.06);

      gain.gain.setValueAtTime(vol * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  },

  // Solitaire: Victory gentle baroque chime chord
  solitaireVictory(vol = 0.4) {
    if (getMuted()) return;
    const ctx = getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C E G C E
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + idx * 0.12;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(vol * 0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
    } catch {}
  },

  // Minesweeper (8-bit): spade in the dirt
  cellClick(vol = 0.3) {
    play((ctx, now) => {
      noise(ctx, { start: now, duration: 0.05, volume: vol * 0.5, period: 3, periodTo: 9 });
      chip(ctx, { freq: NOTE.C6, slideTo: NOTE.C5, start: now, duration: 0.05, volume: vol * 0.25, duty: 0.125 });
    });
  },

  // Minesweeper (8-bit): flag planted
  flagPop(vol = 0.35) {
    play((ctx, now) => {
      chip(ctx, { freq: NOTE.A5, start: now, duration: 0.05, volume: vol * 0.3, duty: 0.5 });
      chip(ctx, { freq: NOTE.E6, start: now + 0.05, duration: 0.08, volume: vol * 0.3, duty: 0.5 });
    });
  },

  // Minesweeper (8-bit): flag pulled out
  flagRemove(vol = 0.3) {
    play((ctx, now) => {
      chip(ctx, { freq: NOTE.E6, start: now, duration: 0.04, volume: vol * 0.25, duty: 0.5 });
      chip(ctx, { freq: NOTE.A5, start: now + 0.04, duration: 0.07, volume: vol * 0.25, duty: 0.5 });
    });
  },

  // Minesweeper (8-bit): a patch of meadow opens — quick rising arpeggio
  cascadeWave(dist: number, vol = 0.2) {
    play((ctx, now) => {
      const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6].slice(0, Math.min(5, 3 + Math.floor(dist / 3)));
      notes.forEach((freq, i) => chip(ctx, { freq, start: now + i * 0.035, duration: 0.05, volume: vol * 0.55, duty: 0.125 }));
      noise(ctx, { start: now, duration: 0.12, volume: vol * 0.35, period: 6, periodTo: 2 });
    });
  },

  // Minesweeper (8-bit): open neighbours around a number
  chordSound(vol = 0.35) {
    play((ctx, now) => {
      [NOTE.G5, NOTE.B5, NOTE.D6].forEach((freq, i) => chip(ctx, { freq, start: now + i * 0.03, duration: 0.04, volume: vol * 0.3, duty: 0.25 }));
    });
  },

  // Minesweeper (8-bit): mine — noise burst falling in pitch plus a triangle thump
  explosion(vol = 0.5) {
    play((ctx, now) => {
      noise(ctx, { start: now, duration: 0.7, volume: vol * 0.7, period: 2, periodTo: 48 });
      chip(ctx, { freq: 110, slideTo: 36, start: now, duration: 0.42, volume: vol * 0.8, wave: "triangle" });
      chip(ctx, { freq: NOTE.G4, slideTo: 98, start: now + 0.02, duration: 0.3, volume: vol * 0.18, duty: 0.5 });
    });
  },

  // Minesweeper (8-bit): level-clear jingle
  minesweeperVictory(vol = 0.45) {
    play((ctx, now) => {
      const lead: Array<[number, number, number]> = [
        [NOTE.G4, 0, 0.09],
        [NOTE.C5, 0.09, 0.09],
        [NOTE.E5, 0.18, 0.09],
        [NOTE.G5, 0.27, 0.18],
        [NOTE.E5, 0.45, 0.09],
        [NOTE.G5, 0.54, 0.42],
      ];
      lead.forEach(([freq, at, duration]) => chip(ctx, { freq, start: now + at, duration, volume: vol * 0.28, duty: 0.25 }));
      lead.forEach(([freq, at, duration]) => chip(ctx, { freq: freq * 2, start: now + at + 0.012, duration, volume: vol * 0.08, duty: 0.125 }));
      [[NOTE.C4 / 2, 0], [NOTE.G3, 0.27], [NOTE.C4, 0.54]].forEach(([freq, at]) =>
        chip(ctx, { freq, start: now + at, duration: 0.26, volume: vol * 0.55, wave: "triangle" }),
      );
    });
  },

  // Minesweeper (8-bit): menu cursor blip
  uiBlip(vol = 0.25) {
    play((ctx, now) => {
      chip(ctx, { freq: NOTE.E6, start: now, duration: 0.035, volume: vol * 0.25, duty: 0.125 });
    });
  },
};
