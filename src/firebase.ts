/**
 * Firebase Core Configuration
 *
 * Initializes Firebase using environment variables.
 * All env vars are validated at startup to ensure proper configuration.
 *
 * This module provides the singleton Firebase app instance along with
 * pre-configured Firestore and Auth services.
 *
 * @module firebase
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { logger } from "./core/utils/logger";

// =============================================================================
// Configuration Validation
// =============================================================================

/**
 * Required Firebase environment variable keys.
 * Each must be defined as a VITE_FIREBASE_* env var at build time.
 */
const REQUIRED_ENV_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

/**
 * Validates that all required Firebase environment variables are present.
 * Throws a descriptive error listing any missing keys.
 */
function validateFirebaseEnv(): void {
  const missing = REQUIRED_ENV_KEYS.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables:\n` +
      `  ${missing.join("\n  ")}\n\n` +
      `Ensure these are defined in .env.local (local dev) or as ` +
      `GitHub Actions secrets (CI/CD deployment).`
    );
  }
}

// Validate before initializing
validateFirebaseEnv();

// =============================================================================
// Firebase Initialization
// =============================================================================

/** Firebase configuration derived from build-time environment variables. */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} as const;

/** Singleton Firebase application instance. */
const app: FirebaseApp = initializeApp(firebaseConfig);

/** Pre-configured Firestore database instance. */
export const db: Firestore = getFirestore(app);

/** Pre-configured Firebase Auth instance with local persistence. */
export const auth: Auth = getAuth(app);

// Set persistence to LOCAL so sessions survive page refreshes
setPersistence(auth, browserLocalPersistence).catch((error: Error) => {
  logger.error("[Firebase] Auth persistence error:", error.message);
});

export default app;
