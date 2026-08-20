import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Same Firebase project used by the game (astro-nova-idle) so beta signups
// collected on dynastynova.com feed the exact same "betaRequests" collection
// as play-astronova.com — no data migration needed once the domain switches.
const firebaseConfig = {
  apiKey: "AIzaSyDdgq1_5NsZk-jpoxNYAfwfh8an0iGmuXk",
  authDomain: "astro-nova-idle.firebaseapp.com",
  projectId: "astro-nova-idle",
  storageBucket: "astro-nova-idle.firebasestorage.app",
  messagingSenderId: "392354709618",
  appId: "1:392354709618:web:154a720959c3c76a8d02eb",
};

export function getBetaDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}
