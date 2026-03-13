import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import { generateFriendCode } from "../utils/friendCode";

export async function ensureFriendCode(playerId) {
  const playerRef = doc(db, "players", playerId);
  const snap = await getDoc(playerRef);
  if (snap.exists() && snap.data().friendCode) return snap.data().friendCode;

  let code, attempts = 0;
  do {
    code = generateFriendCode();
    const codeSnap = await getDoc(doc(db, "friendCodes", code));
    if (!codeSnap.exists()) break;
  } while (++attempts < 10);

  await setDoc(doc(db, "friendCodes", code), { playerId });
  await setDoc(playerRef, { friendCode: code }, { merge: true });
  return code;
}

export async function addFriendByCode(myPlayerId, rawCode) {
  const code = rawCode.trim();
  const codeSnap = await getDoc(doc(db, "friendCodes", code));
  if (!codeSnap.exists()) throw new Error("Code not found. Check it and try again.");
  const friendId = codeSnap.data().playerId;
  if (friendId === myPlayerId) throw new Error("That's your own code!");
  await setDoc(doc(db, "players", myPlayerId), { friends: arrayUnion(friendId) }, { merge: true });
  return friendId;
}

export async function getFriends(playerId) {
  const snap = await getDoc(doc(db, "players", playerId));
  if (!snap.exists()) return [];
  const ids = snap.data().friends || [];
  if (!ids.length) return [];
  const docs = await Promise.all(ids.map(id => getDoc(doc(db, "players", id))));
  return docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }));
}
