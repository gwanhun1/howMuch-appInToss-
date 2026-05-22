import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const isQaMode = import.meta.env.VITE_QA_MODE === "true";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics =
  !isQaMode && typeof window !== "undefined" ? getAnalytics(app) : null;

if (isQaMode) {
  const firestoreHost =
    import.meta.env.VITE_QA_FIRESTORE_HOST || "localhost:8080";
  const authHost =
    import.meta.env.VITE_QA_AUTH_HOST || "http://localhost:9099";
  const [host, portStr] = firestoreHost.split(":");
  connectFirestoreEmulator(db, host, Number(portStr));
  connectAuthEmulator(auth, authHost, { disableWarnings: true });

  // QA 워커가 시드 시점을 결정할 수 있도록 auth uid를 window에 노출.
  auth.onAuthStateChanged((user) => {
    (window as unknown as { __QA_AUTH_UID__?: string }).__QA_AUTH_UID__ =
      user?.uid;
  });
}
