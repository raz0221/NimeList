import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
// @ts-ignore - Mengabaikan error TypeScript untuk fungsi ini
import AsyncStorage from "@react-native-async-storage/async-storage";
// eslint-disable-next-line import/no-duplicates
// @ts-ignore - firebase/auth TS types don't include this by default but bundler does
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCODDLwgjs0UdOFI6v6A5zLB_PSwjDivhI",
  authDomain: "anitrack-app-d8f2a.firebaseapp.com",
  projectId: "anitrack-app-d8f2a",
  storageBucket: "anitrack-app-d8f2a.firebasestorage.app",
  messagingSenderId: "963055544710",
  appId: "1:963055544710:web:6194083aff709272e3e407",
  measurementId: "G-SJ7RPSP3DC",
};

let app: FirebaseApp;
let auth: Auth; // <-- Ini akan menghilangkan error merah 'any' di [id].tsx

// Mencegah inisialisasi ganda saat Fast Refresh
if (!getApps().length) {
  app = initializeApp(firebaseConfig);

  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
