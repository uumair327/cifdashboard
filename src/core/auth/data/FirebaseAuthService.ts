/**
 * Firebase Authentication Service Implementation
 * Data layer implementation of IAuthService using Firebase
 */
import { 
  Auth,
  GoogleAuthProvider, 
  signInWithPopup, 
  browserPopupRedirectResolver,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { IAuthService, User } from '../domain/IAuthService';

export class FirebaseAuthService implements IAuthService {
  private auth: Auth;
  private provider: GoogleAuthProvider;

  constructor(auth: Auth) {
    this.auth = auth;
    this.provider = new GoogleAuthProvider();
    this.provider.setCustomParameters({
      prompt: 'select_account',
      authType: 'signIn'
    });
  }

  /**
   * Convert Firebase User to domain User
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser | null): User | null {
    if (!firebaseUser) return null;
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    };
  }

  getCurrentUser(): User | null {
    return this.mapFirebaseUser(this.auth.currentUser);
  }

  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(
        this.auth, 
        this.provider, 
        browserPopupRedirectResolver
      );
      const user = this.mapFirebaseUser(result.user);
      
      if (!user) {
        throw new Error('Failed to get user information');
      }
      
      return user;
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      
      // Map Firebase error codes to user-friendly messages
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Please allow popups for this website');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Login was cancelled');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login popup was closed');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Firebase Authentication');
      } else {
        throw new Error(error.message || 'Failed to login with Google');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, (firebaseUser) => {
      callback(this.mapFirebaseUser(firebaseUser));
    });
  }
}
