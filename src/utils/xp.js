// ─── Level thresholds ────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1,  xpRequired: 0    },
  { level: 2,  xpRequired: 100  },
  { level: 3,  xpRequired: 250  }, // unlocks Challenger
  { level: 4,  xpRequired: 500  },
  { level: 5,  xpRequired: 900  }, // unlocks Master
  { level: 6,  xpRequired: 1400 },
  { level: 7,  xpRequired: 2100 },
  { level: 8,  xpRequired: 3000 },
  { level: 9,  xpRequired: 4500 },
  { level: 10, xpRequired: 7000 },
];

export const CHALLENGER_UNLOCK_LEVEL = 3;
export const MASTER_UNLOCK_LEVEL     = 5;

const DIFF_MULTIPLIERS = { explorer: 1, challenger: 1.5, master: 2 };

// ─── localStorage keys ───────────────────────────────────────────────────────
const XP_KEY      = "wq_xp";
const STREAK_KEY  = "wq_streak";
const DATE_KEY    = "wq_streak_date";
const BADGES_KEY  = "wq_badges";

// ─── XP helpers ──────────────────────────────────────────────────────────────
export function getTotalXp() {
  return parseInt(localStorage.getItem(XP_KEY) || "0", 10);
}

function setTotalXp(xp) {
  localStorage.setItem(XP_KEY, String(xp));
}

export function calcXpEarned(score, difficulty) {
  const base = score * 10;
  const mult = DIFF_MULTIPLIERS[difficulty] || 1;
  return Math.round(base * mult);
}

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next    = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next    = LEVELS[i + 1] ?? null;
      break;
    }
  }
  const xpIntoLevel = xp - current.xpRequired;
  const xpForLevel  = next ? next.xpRequired - current.xpRequired : null;
  return { level: current.level, xpIntoLevel, xpForLevel };
}

export function isChallengerUnlocked(xp) {
  return getLevelInfo(xp).level >= CHALLENGER_UNLOCK_LEVEL;
}

export function isMasterUnlocked(xp) {
  return getLevelInfo(xp).level >= MASTER_UNLOCK_LEVEL;
}

// ─── Streak helpers ───────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getStreak() {
  return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
}

// Call once per game finish. Returns { streak, isNew }
function updateStreak() {
  const today    = todayStr();
  const lastDate = localStorage.getItem(DATE_KEY);
  if (lastDate === today) return { streak: getStreak(), isNew: false };

  const yesterday = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const current   = getStreak();
  const newStreak = lastDate === yesterday ? current + 1 : 1;
  localStorage.setItem(STREAK_KEY, String(newStreak));
  localStorage.setItem(DATE_KEY, today);
  return { streak: newStreak, isNew: newStreak > current };
}

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGE_DEFS = [
  { id: "first_game",      emoji: "🎮", name: "First Steps",   desc: "Play your first game" },
  { id: "first_perfect",   emoji: "💯", name: "Perfect Score", desc: "Get 10/10 in any game" },
  { id: "challenger_play", emoji: "⚔️", name: "Challenger",    desc: "Play a Challenger game" },
  { id: "master_play",     emoji: "🔥", name: "Master",        desc: "Play a Master game" },
  { id: "streak_3",        emoji: "🌶️", name: "On Fire",       desc: "3-day streak" },
  { id: "streak_7",        emoji: "🌟", name: "Dedicated",     desc: "7-day streak" },
  { id: "level_3",         emoji: "⬆️", name: "Rising Star",   desc: "Reach Level 3" },
  { id: "level_5",         emoji: "🏆", name: "Elite",         desc: "Reach Level 5" },
];

export function getEarnedBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || "[]"); }
  catch { return []; }
}

function checkAndSaveBadges({ score, total, difficulty, streak, level }) {
  const earned    = new Set(getEarnedBadges());
  const newBadges = [];
  function earn(id) {
    if (!earned.has(id)) { earned.add(id); newBadges.push(id); }
  }
  earn("first_game");
  if (score === total)               earn("first_perfect");
  if (difficulty === "challenger")   earn("challenger_play");
  if (difficulty === "master")       earn("master_play");
  if (streak >= 3)                   earn("streak_3");
  if (streak >= 7)                   earn("streak_7");
  if (level  >= 3)                   earn("level_3");
  if (level  >= 5)                   earn("level_5");
  if (newBadges.length > 0) {
    localStorage.setItem(BADGES_KEY, JSON.stringify([...earned]));
  }
  return newBadges;
}

// ─── Main: call once per game finish ─────────────────────────────────────────
// Returns { xpEarned, totalXp, prevLevel, newLevel, leveledUp, streak, newBadges }
export function processGameRewards(score, total, difficulty) {
  const xpEarned  = calcXpEarned(score, difficulty);
  const prevXp    = getTotalXp();
  const totalXp   = prevXp + xpEarned;
  setTotalXp(totalXp);

  const prevLevel = getLevelInfo(prevXp).level;
  const newLevel  = getLevelInfo(totalXp).level;
  const leveledUp = newLevel > prevLevel;

  const { streak } = updateStreak();

  const newBadges = checkAndSaveBadges({ score, total, difficulty, streak, level: newLevel });

  return { xpEarned, totalXp, prevLevel, newLevel, leveledUp, streak, newBadges };
}
