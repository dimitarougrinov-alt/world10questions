// ─── music.js – background music player ───────────────────────────────────
// Loads the MP3 into the SAME AudioContext used by sounds.js so that both
// streams are mixed by the browser's audio graph natively.
// Ducking: whenever a sound effect fires, music gain dips quickly then rises.

import { ac, registerDuck } from './sounds';

const MUSIC_URL  = '/music/12-danny_byrd-sweet_harmony_(feat_liquid).mp3';
const GAIN_FULL  = 0.28;    // comfortable background level
const GAIN_DUCK  = 0.05;    // quieted while SFX plays
const RAMP_DUCK  = 0.07;    // seconds to duck down
const RAMP_RISE  = 1.20;    // seconds to rise back up
const UNDUCK_MS  = 500;     // ms after last SFX before unducking

let musicGain   = null;     // GainNode – persists for mute control
let musicSource = null;     // BufferSourceNode – replaced on restart
let audioBuffer = null;     // decoded PCM
let rawBuffer   = null;     // pre-fetched ArrayBuffer (before decode)
let unduckTimer = null;
let isPlaying   = false;
let isMuted     = false;

// ─── Duck + unduck ────────────────────────────────────────────────────────
function unduck() {
  if (!musicGain || isMuted) return;
  const c   = ac();
  const now = c.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.linearRampToValueAtTime(GAIN_FULL, now + RAMP_RISE);
}

function duck() {
  if (!musicGain || isMuted) return;
  const c   = ac();
  const now = c.currentTime;
  clearTimeout(unduckTimer);
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.linearRampToValueAtTime(GAIN_DUCK, now + RAMP_DUCK);
  unduckTimer = setTimeout(unduck, UNDUCK_MS);
}

// Register with sounds.js immediately — no AudioContext required yet
registerDuck(duck);

// ─── Buffer management ────────────────────────────────────────────────────
// Prefetch raw bytes without needing AudioContext (call on app mount).
export function preloadMusic() {
  if (rawBuffer || audioBuffer) return;
  fetch(MUSIC_URL)
    .then(r => r.arrayBuffer())
    .then(ab => { rawBuffer = ab; })
    .catch(() => {});
}

async function ensureBuffer() {
  if (audioBuffer) return true;
  const c = ac();
  try {
    let ab;
    if (rawBuffer) {
      ab       = rawBuffer;
      rawBuffer = null;           // decodeAudioData may detach the buffer
    } else {
      const res = await fetch(MUSIC_URL);
      ab        = await res.arrayBuffer();
    }
    audioBuffer = await c.decodeAudioData(ab);
    return true;
  } catch (e) {
    console.warn('[music] load error:', e);
    return false;
  }
}

// ─── Playback control ─────────────────────────────────────────────────────
export async function startMusic() {
  if (isPlaying) return;
  const ok = await ensureBuffer();
  if (!ok) return;
  if (isPlaying) return;          // double-check after async gap

  const c = ac();

  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = isMuted ? 0 : GAIN_FULL;
    musicGain.connect(c.destination);
  }

  musicSource        = c.createBufferSource();
  musicSource.buffer = audioBuffer;
  musicSource.loop   = true;
  musicSource.connect(musicGain);
  musicSource.start(0);
  isPlaying = true;
}

export function setMuted(muted) {
  isMuted = muted;
  if (!musicGain) return;
  const c   = ac();
  const now = c.currentTime;
  clearTimeout(unduckTimer);
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.linearRampToValueAtTime(muted ? 0 : GAIN_FULL, now + 0.35);
}
