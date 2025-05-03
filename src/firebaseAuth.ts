import { auth } from "./firebase.ts";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

const loginWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    return res.user;
  } catch (error: any) {
    console.error("Firebase auth error:", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Please allow popups for this website');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Login was cancelled');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login popup was closed');
    } else {
      throw new Error(error.message || 'Failed to login with Google');
    }
  }
};

const logoutGoogle = async () => {
  try {
    await auth.signOut();
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error(error.message || 'Failed to logout');
  }
};

export { loginWithGoogle, logoutGoogle };
