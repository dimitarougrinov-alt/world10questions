import {
  doc, getDoc, setDoc, addDoc,
  collection, query, where, orderBy,
  getDocs, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function saveSession(playerId, score, total) {
  const percentage = Math.round((score / total) * 100);

  await addDoc(collection(db, "sessions"), {
    playerId,
    score,
    total,
    percentage,
    timestamp: serverTimestamp(),
  });

  const playerRef = doc(db, "players", playerId);
  const snap = await getDoc(playerRef);

  if (snap.exists()) {
    const d = snap.data();
    const newGames = d.gamesPlayed + 1;
    const newCorrect = d.totalCorrect + score;
    const newQuestions = d.totalQuestions + total;
    await setDoc(playerRef, {
      gamesPlayed: newGames,
      totalCorrect: newCorrect,
      totalQuestions: newQuestions,
      avgPercentage: Math.round((newCorrect / newQuestions) * 100),
      bestPercentage: Math.max(d.bestPercentage, percentage),
      lastPlayed: serverTimestamp(),
    });
  } else {
    await setDoc(playerRef, {
      gamesPlayed: 1,
      totalCorrect: score,
      totalQuestions: total,
      avgPercentage: percentage,
      bestPercentage: percentage,
      lastPlayed: serverTimestamp(),
    });
  }
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
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLeaderboard() {
  const q = query(
    collection(db, "players"),
    orderBy("avgPercentage", "desc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
