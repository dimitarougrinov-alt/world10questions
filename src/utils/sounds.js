let ctx = null;
let master = null;

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function note({ freq, freqEnd = null, type = "sine", start = 0, duration = 0.2, attack = 0.012, gain = 0.3 }) {
  const c = ac();
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.connect(g);
  g.connect(master);

  osc.type = type;
  const t = c.currentTime + start;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  }

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// Smooth layered space-travel whoosh
export function soundTransition() {
  note({ freq: 260, freqEnd: 700,  type: "sine", duration: 0.38, gain: 0.16, attack: 0.04 });
  note({ freq: 520, freqEnd: 1400, type: "sine", duration: 0.30, gain: 0.07, attack: 0.06, start: 0.05 });
}

// Warm three-note ascending chime
export function soundCorrect() {
  note({ freq: 523,  type: "triangle", duration: 0.30, gain: 0.34, start: 0    });
  note({ freq: 659,  type: "triangle", duration: 0.30, gain: 0.30, start: 0.12 });
  note({ freq: 784,  type: "triangle", duration: 0.45, gain: 0.28, start: 0.24 });
}

// Soft descending boop — no harsh buzz
export function soundWrong() {
  note({ freq: 330, freqEnd: 175, type: "sine", duration: 0.30, gain: 0.20, attack: 0.01 });
  note({ freq: 110,               type: "sine", duration: 0.18, gain: 0.14, attack: 0.005 });
}

// Triumphant four-note fanfare
export function soundComplete() {
  note({ freq: 523,  type: "triangle", duration: 0.16, gain: 0.30, start: 0.00 });
  note({ freq: 659,  type: "triangle", duration: 0.16, gain: 0.30, start: 0.16 });
  note({ freq: 784,  type: "triangle", duration: 0.16, gain: 0.30, start: 0.32 });
  note({ freq: 1047, type: "triangle", duration: 0.55, gain: 0.36, start: 0.48, attack: 0.02 });
}
