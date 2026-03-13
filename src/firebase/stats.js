import {
  doc, getDoc, setDoc, addDoc,
  collection, query, where, orderBy,
  getDocs, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

function updatedCategoryStats(existing, score, total, percentage, totalTime) {
  const d = existing || { gamesPlayed: 0, totalCorrect: 0, totalQuestions: 0, bestPercentage: 0, bestTime: null };
  const newGames    = d.gamesPlayed + 1;
  const newCorrect  = d.totalCorrect + score;
  const newQuestions = d.totalQuestions + total;
  const newBestPct  = Math.max(d.bestPercentage, percentage);

  let newBestTime = d.bestTime ?? null;
  if (percentage > d.bestPercentage) {
    newBestTime = totalTime;
  } else if (percentage === d.bestPercentage) {
    if (totalTime !== null && (newBestTime === null || totalTime < newBestTime)) {
      newBestTime = totalTime;
    }
  }

  return {
    gamesPlayed:    newGames,
    totalCorrect:   newCorrect,
    totalQuestions: newQuestions,
    avgPercentage:  Math.round((newCorrect / newQuestions) * 100),
    bestPercentage: newBestPct,
    bestTime:       newBestTime,
  };
}

// Returns the flat key used for per-category(-difficulty) stats on the player doc
function statKey(category, difficulty) {
  if (!category) return null;
  return difficulty ? `${category}_${difficulty}` : category;
}

export async function saveSession(playerId, score, total, country = null, totalTime = null, category = null, difficulty = null) {
  const percentage = Math.round((score / total) * 100);
  const key = statKey(category, difficulty);

  await addDoc(collection(db, "sessions"), {
    playerId,
    score,
    total,
    percentage,
    totalTime,
    category,
    difficulty,
    timestamp: serverTimestamp(),
  });

  const playerRef = doc(db, "players", playerId);
  const snap = await getDoc(playerRef);
  const existing = snap.exists() ? snap.data() : null;

  const globalStats = updatedCategoryStats(
    existing ? { gamesPlayed: existing.gamesPlayed, totalCorrect: existing.totalCorrect, totalQuestions: existing.totalQuestions, bestPercentage: existing.bestPercentage, bestTime: existing.bestTime } : null,
    score, total, percentage, totalTime
  );

  const categoryStats = key
    ? updatedCategoryStats(existing?.[key] ?? null, score, total, percentage, totalTime)
    : null;

  await setDoc(playerRef, {
    ...globalStats,
    lastPlayed: serverTimestamp(),
    ...(existing?.country ? {} : country ? { country } : {}),
    ...(key && categoryStats ? { [key]: categoryStats } : {}),
  }, { merge: true });
}

export async function getPlayerStats(playerId) {
  const snap = await getDoc(doc(db, "players", playerId));
  return snap.exists() ? snap.data() : null;
}

export async function getPlayerSessions(playerId) {
  const q = query(
    collection(db, "sessions"),
    where("playerId", "==", playerId),
    orderBy("timestamp", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLeaderboard(category = null, difficulty = null) {
  const key = statKey(category, difficulty);
  const q = query(collection(db, "players"), limit(50));
  const snap = await getDocs(q);
  const players = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => key ? p[key] : true)
    .map((p) => ({
      id: p.id,
      country: p.country,
      username: p.username ?? null,
      level:   p.level   ?? 1,
      badges:  p.badges  ?? [],
      streak:  p.streak  ?? 0,
      gamesPlayed:    key ? (p[key]?.gamesPlayed    ?? 0)    : p.gamesPlayed,
      bestPercentage: key ? (p[key]?.bestPercentage ?? 0)    : p.bestPercentage,
      avgPercentage:  key ? (p[key]?.avgPercentage  ?? 0)    : p.avgPercentage,
      bestTime:       key ? (p[key]?.bestTime       ?? null) : p.bestTime,
    }))
    .sort((a, b) => {
      if (b.bestPercentage !== a.bestPercentage) return b.bestPercentage - a.bestPercentage;
      if (a.bestTime == null) return 1;
      if (b.bestTime == null) return -1;
      return a.bestTime - b.bestTime;
    })
    .slice(0, 10);

  return players;
}

export async function saveUsername(playerId, username) {
  await setDoc(doc(db, "players", playerId), { username }, { merge: true });
}

export async function savePlayerProgress(playerId, xp, level, streak, badges) {
  await setDoc(doc(db, "players", playerId), { xp, level, streak, badges }, { merge: true });
}

function mergeStatBlock(a, b) {
  if (!a) return b;
  if (!b) return a;
  const combined = {
    gamesPlayed:    a.gamesPlayed    + b.gamesPlayed,
    totalCorrect:   a.totalCorrect   + b.totalCorrect,
    totalQuestions: a.totalQuestions + b.totalQuestions,
    bestPercentage: Math.max(a.bestPercentage, b.bestPercentage),
  };
  combined.avgPercentage = Math.round((combined.totalCorrect / combined.totalQuestions) * 100);
  if (a.bestPercentage > b.bestPercentage)       combined.bestTime = a.bestTime;
  else if (b.bestPercentage > a.bestPercentage)  combined.bestTime = b.bestTime;
  else {
    if (a.bestTime === null)      combined.bestTime = b.bestTime;
    else if (b.bestTime === null) combined.bestTime = a.bestTime;
    else combined.bestTime = Math.min(a.bestTime, b.bestTime);
  }
  return combined;
}

export async function migratePlayer(fromId, toId) {
  if (!fromId || fromId === toId) return;
  const fromSnap = await getDoc(doc(db, "players", fromId));
  if (!fromSnap.exists()) return;

  const from = fromSnap.data();
  const toRef = doc(db, "players", toId);
  const toSnap = await getDoc(toRef);
  const to = toSnap.exists() ? toSnap.data() : null;

  // Merge all stat keys (global + per-category-difficulty)
  const statKeys = ["gamesPlayed", "totalCorrect", "totalQuestions", "bestPercentage", "bestTime", "avgPercentage"];
  const blockKeys = Object.keys(from).filter(k => !statKeys.includes(k) && typeof from[k] === "object" && from[k] !== null && "gamesPlayed" in from[k]);

  const merged = {
    ...mergeStatBlock(
      to ? { gamesPlayed: to.gamesPlayed, totalCorrect: to.totalCorrect, totalQuestions: to.totalQuestions, bestPercentage: to.bestPercentage, bestTime: to.bestTime } : null,
      { gamesPlayed: from.gamesPlayed, totalCorrect: from.totalCorrect, totalQuestions: from.totalQuestions, bestPercentage: from.bestPercentage, bestTime: from.bestTime }
    ),
    country:    to?.country    ?? from.country    ?? null,
    username:   to?.username   ?? from.username   ?? null,
    lastPlayed: to?.lastPlayed ?? from.lastPlayed ?? null,
    migratedFrom: fromId,
  };

  for (const key of blockKeys) {
    merged[key] = mergeStatBlock(to?.[key] ?? null, from[key]);
  }

  await setDoc(toRef, merged, { merge: true });
}

export async function getTimePercentile(percentage, totalTime, category = null, difficulty = null) {
  if (totalTime == null) return null;
  const constraints = [where("percentage", "==", percentage)];
  if (category) constraints.push(where("category", "==", category));
  if (difficulty) constraints.push(where("difficulty", "==", difficulty));
  const q = query(collection(db, "sessions"), ...constraints);
  const snap = await getDocs(q);
  const times = snap.docs.map((d) => d.data().totalTime).filter((t) => t != null);
  if (times.length < 2) return null;
  const slower = times.filter((t) => t > totalTime).length;
  return Math.round((slower / times.length) * 100);
}
