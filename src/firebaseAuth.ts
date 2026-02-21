/**
 * Firebase Authentication Utilities
 *
 * Provides Google sign-in and sign-out functionality using Firebase Auth.
 * These are thin wrappers consumed by the AuthService layer; domain logic
 * should NOT call these directly.
 *
 * @module firebaseAuth
 */
import { auth } from "./firebase";
import { logger } from "./core/utils/logger";
import {
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
  type User,
} from "firebase/auth";

// =============================================================================
// Provider Configuration
// =============================================================================

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  authType: "signIn",
});

// =============================================================================
// Auth Error Mapping
// =============================================================================

/** Maps Firebase auth error codes to user-friendly messages. */
const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  "auth/popup-blocked": "Please allow popups for this website",
  "auth/cancelled-popup-request": "Login was cancelled",
  "auth/popup-closed-by-user": "Login popup was closed",
  "auth/unauthorized-domain":
    "This domain is not authorized for Firebase Authentication. " +
    "Add it in Firebase Console → Authentication → Settings → Authorized domains.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
  "auth/too-many-requests":
    "Too many login attempts. Please try again later.",
} as const;

/**
 * Extracts a user-friendly message from a Firebase auth error.
 *
 * @param error - The caught error object
 * @returns A human-readable error message
 */
function getAuthErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  ) {
    const code = (error as { code: string }).code;
    return AUTH_ERROR_MESSAGES[code] ?? `Authentication failed (${code})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected authentication error occurred";
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Signs in using Google OAuth popup.
 *
 * @returns The authenticated Firebase user
 * @throws Error with a user-friendly message on failure
 */
async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider,
      browserPopupRedirectResolver
    );
    return result.user;
  } catch (error: unknown) {
    logger.error("[Auth] Google sign-in failed:", error);
    throw new Error(getAuthErrorMessage(error));
  }
}

/**
 * Signs out the current user.
 *
 * @throws Error with a user-friendly message on failure
 */
async function logoutGoogle(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error: unknown) {
    logger.error("[Auth] Sign-out failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to logout"
    );
  }
}

export { loginWithGoogle, logoutGoogle };
