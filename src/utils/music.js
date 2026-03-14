// ─── music.js – background music player ───────────────────────────────────
// Plays a sequential playlist of tracks. When one ends, the next begins.
// Ducking: whenever a sound effect fires, music gain dips quickly then rises.

import { ac, registerDuck } from './sounds';

const PLAYLIST = [
  '/music/12-danny_byrd-sweet_harmony_(feat_liquid).mp3',
  '/music/Apex - String Theory.mp3',
  '/music/Bachelors Of Science - The Ice Dance.mp3',
];

const GAIN_FULL  = 0.28;
const GAIN_DUCK  = 0.05;
const RAMP_DUCK  = 0.07;
const RAMP_RISE  = 1.20;
const UNDUCK_MS  = 500;

let musicGain    = null;
let musicSource  = null;
let audioBuffers = new Array(PLAYLIST.length).fill(null);
let rawBuffers   = new Array(PLAYLIST.length).fill(null);
let currentTrack = 0;
let unduckTimer  = null;
let isPlaying    = false;
let isMuted      = false;

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

registerDuck(duck);

// ─── Buffer management ────────────────────────────────────────────────────
export function preloadMusic() {
  if (rawBuffers[0] || audioBuffers[0]) return;
  fetch(PLAYLIST[0])
    .then(r => r.arrayBuffer())
    .then(ab => { rawBuffers[0] = ab; })
    .catch(() => {});
}

async function ensureBuffer(index) {
  if (audioBuffers[index]) return true;
  const c = ac();
  try {
    let ab;
    if (rawBuffers[index]) {
      ab = rawBuffers[index];
      rawBuffers[index] = null;
    } else {
      const res = await fetch(PLAYLIST[index]);
      ab = await res.arrayBuffer();
    }
    audioBuffers[index] = await c.decodeAudioData(ab);
    return true;
  } catch (e) {
    console.warn('[music] load error:', e);
    return false;
  }
}

// ─── Playback control ─────────────────────────────────────────────────────
async function playTrack(index) {
  const ok = await ensureBuffer(index);
  if (!ok || !isPlaying) return;

  const c = ac();

  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = isMuted ? 0 : GAIN_FULL;
    musicGain.connect(c.destination);
  }

  musicSource        = c.createBufferSource();
  musicSource.buffer = audioBuffers[index];
  musicSource.loop   = false;
  musicSource.connect(musicGain);
  musicSource.onended = () => {
    if (!isPlaying) return;
    const next = (index + 1) % PLAYLIST.length;
    currentTrack = next;
    playTrack(next);
  };
  musicSource.start(0);

  // Preload the next track in the background
  const nextIndex = (index + 1) % PLAYLIST.length;
  ensureBuffer(nextIndex).catch(() => {});
}

export async function startMusic() {
  if (isPlaying) return;
  isPlaying = true;
  await playTrack(currentTrack);
}

export function pauseMusic() {
  const c = ac();
  if (c.state === 'running') c.suspend();
}

export function resumeMusic() {
  if (!isPlaying || isMuted) return;
  const c = ac();
  if (c.state === 'suspended') c.resume();
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
