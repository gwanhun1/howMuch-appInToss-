import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore/lite";
import { getAuth, connectAuthEmulator } from "firebase/auth";

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

// 일회성 조회/트랜잭션만 사용하므로 WebChannel 지속 연결이 필요하지 않습니다.
// Lite는 HTTPS REST로 통신해 웹뷰의 스트리밍 연결 지연을 피합니다.
export const db = getFirestore(app);
export const auth = getAuth(app);

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
