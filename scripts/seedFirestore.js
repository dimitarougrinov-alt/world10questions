/**
 * One-time script to seed Firestore with the countries dataset.
 *
 * Usage:
 *   1. npm install (if not done yet)
 *   2. Set FIREBASE_PROJECT_ID in your environment, or edit the projectId below.
 *   3. Authenticate: run `firebase login` and ensure Application Default Credentials are set,
 *      OR set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
 *   4. node scripts/seedFirestore.js
 *
 * This writes each country as a document in the "countries" collection.
 * Documents are keyed by country name for easy lookup.
 * Safe to re-run — it uses set() so existing docs are overwritten.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// ---------------------------------------------------------------------------
// Bootstrap: load countries from src/data/countries.js
// We read it as plain text and eval the array so we don't need a bundler here.
// ---------------------------------------------------------------------------
import countries from "../src/data/countries.js";

// ---------------------------------------------------------------------------
// Firebase Admin init
// ---------------------------------------------------------------------------
if (!getApps().length) {
  // If GOOGLE_APPLICATION_CREDENTIALS is set, cert() picks it up automatically.
  // Otherwise pass a serviceAccount object explicitly.
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
  } else {
    // Will use Application Default Credentials (firebase login / gcloud auth)
    initializeApp();
  }
}

const db = getFirestore(undefined, "world10questions");

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function seed() {
  const collectionRef = db.collection("countries");
  const batch = db.batch();

  for (const entry of countries) {
    const docRef = collectionRef.doc(entry.country);
    batch.set(docRef, {
      country: entry.country,
      capital: entry.capital,
    });
  }

  await batch.commit();
  console.log(`✅ Seeded ${countries.length} countries into Firestore.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
