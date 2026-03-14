// ─── sounds.js – enriched procedural audio engine ─────────────────────────
// Techniques: oscillators, FM synthesis, noise bursts, convolution reverb,
// chorus detuning, filter sweeps, harmonic layering.
// No audio files — everything is synthesised in real time.

let ctx    = null;
let master = null;
let reverb = null;

export function ac() {
  if (!ctx) {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.50;
    master.connect(ctx.destination);

    // ── Convolution reverb: impulse response built from exponential noise ──
    reverb        = ctx.createConvolver();
    const sr      = ctx.sampleRate;
    const len     = Math.floor(sr * 1.8);       // 1.8 s tail
    const buf     = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
    }
    reverb.buffer = buf;

    const rvbGain = ctx.createGain();
    rvbGain.gain.value = 0.26;
    reverb.connect(rvbGain);
    rvbGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ─── Oscillator note ──────────────────────────────────────────────────────
// Signal chain: osc → [filter] → gainEnvelope ──► master        (dry)
//                                               └─► reverb send  (wet)
function note({
  freq,
  freqEnd       = null,
  type          = 'sine',
  start         = 0,
  duration      = 0.2,
  attack        = 0.012,
  gain          = 0.3,
  detune        = 0,
  wet           = 0,
  filterType    = null,
  filterFreq    = 1000,
  filterQ       = 1,
  filterFreqEnd = null,
}) {
  const c = ac();
  const t = c.currentTime + start;

  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t + duration);
  }
  osc.detune.value = detune;

  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  if (filterType) {
    const filt = c.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.setValueAtTime(filterFreq, t);
    filt.Q.value = filterQ;
    if (filterFreqEnd !== null) {
      filt.frequency.exponentialRampToValueAtTime(Math.max(filterFreqEnd, 1), t + duration);
    }
    osc.connect(filt);
    filt.connect(g);
  } else {
    osc.connect(g);
  }

  g.connect(master);
  if (wet > 0 && reverb) {
    const send = c.createGain();
    send.gain.value = wet;
    g.connect(send);
    send.connect(reverb);
  }

  osc.start(t);
  osc.stop(t + duration + 0.08);
}

// ─── FM (frequency-modulation) note ──────────────────────────────────────
// modRatio non-integer → inharmonic → bell / metallic / glassy timbre
// modIndex controls brightness: higher = richer harmonics at attack
function fmNote({
  carrierFreq,
  modRatio = 3.5,
  modIndex = 5,
  type     = 'sine',
  start    = 0,
  duration = 0.5,
  attack   = 0.01,
  gain     = 0.2,
  wet      = 0,
}) {
  const c = ac();
  const t = c.currentTime + start;

  const carrier = c.createOscillator();
  carrier.type  = type;
  carrier.frequency.setValueAtTime(carrierFreq, t);

  const mod = c.createOscillator();
  mod.frequency.setValueAtTime(carrierFreq * modRatio, t);

  const depth   = carrierFreq * modIndex;
  const modGain = c.createGain();
  modGain.gain.setValueAtTime(depth, t);
  // Decay modulation index → progressively more sine-like (natural bell attack)
  modGain.gain.exponentialRampToValueAtTime(Math.max(depth * 0.04, 0.001), t + duration * 0.7);

  const ampGain = c.createGain();
  ampGain.gain.setValueAtTime(0, t);
  ampGain.gain.linearRampToValueAtTime(gain, t + attack);
  ampGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  mod.connect(modGain);
  modGain.connect(carrier.frequency);
  carrier.connect(ampGain);
  ampGain.connect(master);

  if (wet > 0 && reverb) {
    const send = c.createGain();
    send.gain.value = wet;
    ampGain.connect(send);
    send.connect(reverb);
  }

  [mod, carrier].forEach(o => { o.start(t); o.stop(t + duration + 0.08); });
}

// ─── White-noise burst (for click / percussive textures) ─────────────────
function noiseBurst({ start = 0, duration = 0.025, gain = 0.15, filterFreq = 3000, filterQ = 2 }) {
  const c   = ac();
  const t   = c.currentTime + start;
  const len = Math.ceil(c.sampleRate * duration * 4);

  const buf = c.createBuffer(1, len, c.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

  const src  = c.createBufferSource();
  src.buffer = buf;

  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = filterFreq;
  filt.Q.value = filterQ;

  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(filt); filt.connect(g); g.connect(master);
  src.start(t); src.stop(t + duration + 0.02);
}


// ─── Duck hook (registered by music.js — no AudioContext needed) ─────────
let _duckFn = null;
export function registerDuck(fn) { _duckFn = fn; }
function duck() { _duckFn?.(); }


// ════════════════════════════════════════════════════════════════════════════
//  PUBLIC SOUNDS
// ════════════════════════════════════════════════════════════════════════════

// ─── Screen transition: four-harmonic upward sweep ───────────────────────
export function soundTransition() {
  duck();
  note({ freq: 220,  freqEnd: 880,  type: 'sine', duration: 0.44, gain: 0.13, attack: 0.03, wet: 0.35, filterType: 'highpass', filterFreq: 80 });
  note({ freq: 330,  freqEnd: 1320, type: 'sine', duration: 0.36, gain: 0.08, attack: 0.05, wet: 0.28, start: 0.05 });
  note({ freq: 660,  freqEnd: 2640, type: 'sine', duration: 0.28, gain: 0.04, attack: 0.07, wet: 0.20, start: 0.10 });
  note({ freq: 1760, freqEnd: 3300, type: 'sine', duration: 0.20, gain: 0.02, attack: 0.06, wet: 0.15, start: 0.14 });
}

// ─── Correct answer: C-E-G major chord, each voice with chorus & shimmer ─
export function soundCorrect() {
  duck();
  const voices = [
    { freq: 523, s: 0.00 },   // C5
    { freq: 659, s: 0.12 },   // E5
    { freq: 784, s: 0.24 },   // G5
  ];
  voices.forEach(({ freq, s }) => {
    note({ freq, type: 'triangle', duration: 0.42, gain: 0.24, start: s, attack: 0.007, wet: 0.40 });
    note({ freq, type: 'triangle', duration: 0.38, gain: 0.07, start: s, attack: 0.009, wet: 0.16, detune: 8 });  // +8¢ chorus
    note({ freq: freq * 2, type: 'sine', duration: 0.24, gain: 0.03, start: s, attack: 0.004, wet: 0.22 });       // 2nd harmonic
  });
}

// ─── Wrong answer: sub-bass thud + descending mid sweep + dissonance ─────
export function soundWrong() {
  duck();
  note({ freq: 82,  type: 'sine', duration: 0.22, gain: 0.28, attack: 0.004 });           // low thud
  note({ freq: 320, freqEnd: 148, type: 'sine', duration: 0.34, gain: 0.20, attack: 0.005 }); // sweep
  note({ freq: 277, type: 'sine', duration: 0.16, gain: 0.09, attack: 0.003, start: 0.02 }); // dissonant C#
}

// ─── Quiz complete: ascending arpeggio resolving to sustained chord ───────
export function soundComplete() {
  duck();
  const run = [523, 659, 784, 1047, 1319];
  run.forEach((freq, i) => {
    const last = i === run.length - 1;
    note({ freq, type: 'triangle', duration: last ? 0.88 : 0.14, gain: last ? 0.28 : 0.20,
           start: i * 0.15, attack: 0.008, wet: last ? 0.55 : 0.22 });
    if (last) {
      note({ freq: 784,  type: 'triangle', duration: 0.82, gain: 0.14, start: i * 0.15, attack: 0.018, wet: 0.48 });
      note({ freq: 659,  type: 'triangle', duration: 0.72, gain: 0.10, start: i * 0.15, attack: 0.025, wet: 0.42 });
      note({ freq, type: 'triangle', duration: 0.88, gain: 0.07, start: i * 0.15, attack: 0.008, wet: 0.55, detune: 8 });
    }
  });
}

// ─── Perfect score 10/10: extended sparkle fanfare with FM shimmer ────────
export function soundPerfect() {
  duck();
  const run = [523, 659, 784, 1047, 1319, 1568, 2093];
  run.forEach((freq, i) => {
    const last = i === run.length - 1;
    note({ freq, type: 'triangle', duration: last ? 1.35 : 0.13, gain: last ? 0.25 : 0.18,
           start: i * 0.12, attack: 0.007, wet: last ? 0.65 : 0.28 });
    fmNote({ carrierFreq: freq * 2, modRatio: 3.5, modIndex: 2,
             duration: 0.20, gain: 0.045, start: i * 0.12, wet: 0.45 });
    if (last) {
      note({ freq: 1319, type: 'triangle', duration: 1.15, gain: 0.13, start: i * 0.12, attack: 0.022, wet: 0.60 });
      note({ freq: 1047, type: 'triangle', duration: 1.05, gain: 0.09, start: i * 0.12, attack: 0.030, wet: 0.55 });
      note({ freq: 784,  type: 'triangle', duration: 0.95, gain: 0.06, start: i * 0.12, attack: 0.038, wet: 0.50 });
    }
  });
}

// ─── Level up: C-major scale run → triumphant resolution chord ───────────
export function soundLevelUp() {
  duck();
  const scale = [523, 587, 659, 698, 784, 880, 988, 1047];
  scale.forEach((freq, i) => {
    const last = i === scale.length - 1;
    note({ freq, type: 'sawtooth', duration: last ? 0.68 : 0.10, gain: last ? 0.18 : 0.12,
           start: i * 0.09, attack: 0.004, wet: last ? 0.48 : 0.12,
           filterType: 'lowpass', filterFreq: last ? 2800 : 4500, filterQ: 0.7 });
    if (last) {
      note({ freq: 784,  type: 'triangle', duration: 0.65, gain: 0.12, start: i * 0.09, attack: 0.018, wet: 0.45 });
      note({ freq: 659,  type: 'triangle', duration: 0.55, gain: 0.08, start: i * 0.09, attack: 0.025, wet: 0.40 });
    }
  });
}

// ─── Badge unlock: FM bell cluster → ethereal rising shimmer ─────────────
// FM with non-integer modRatio produces inharmonic bell-like overtones
export function soundBadge() {
  duck();
  [800, 1200, 1600, 2100].forEach((freq, i) => {
    fmNote({ carrierFreq: freq, modRatio: 3.5, modIndex: 4,
             duration: 0.95 - i * 0.10, gain: 0.16 - i * 0.03,
             start: i * 0.13, wet: 0.58 });
  });
  note({ freq: 2093, freqEnd: 4186, type: 'sine', duration: 0.55, gain: 0.045,
         start: 0.40, attack: 0.04, wet: 0.48 });
}

// ─── Difficulty unlock: sweeping power surge → resolved triad ────────────
export function soundUnlock() {
  duck();
  note({ freq: 196,  freqEnd: 784,  type: 'sawtooth', duration: 0.60, gain: 0.17, attack: 0.020, wet: 0.30,
         filterType: 'lowpass', filterFreq: 900, filterFreqEnd: 4000 });
  note({ freq: 294,  freqEnd: 1175, type: 'sawtooth', duration: 0.55, gain: 0.12, attack: 0.025, wet: 0.26, start: 0.05,
         filterType: 'lowpass', filterFreq: 900, filterFreqEnd: 4000 });
  note({ freq: 784,  type: 'triangle', duration: 0.62, gain: 0.20, start: 0.53, attack: 0.018, wet: 0.50 });
  note({ freq: 988,  type: 'triangle', duration: 0.56, gain: 0.14, start: 0.55, attack: 0.020, wet: 0.44 });
  note({ freq: 1175, type: 'triangle', duration: 0.50, gain: 0.10, start: 0.57, attack: 0.022, wet: 0.40 });
}

// ─── Subtle UI click (noise burst + soft tone) ───────────────────────────
export function soundClick() {
  noiseBurst({ duration: 0.022, gain: 0.09, filterFreq: 3500, filterQ: 3.5 });
  note({ freq: 1100, type: 'sine', duration: 0.035, gain: 0.04, attack: 0.002 });
}
