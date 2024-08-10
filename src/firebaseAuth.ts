import { auth } from "./firebase.ts";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();

const loginWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    return res.user;
  } catch (error: any) {
    console.error(error.message);
  }
};

const logoutGoogle = async () => {
  try {
    await auth.signOut();
  } catch (error: any) {
    console.error(error.message);
  }
};

export { loginWithGoogle, logoutGoogle };
