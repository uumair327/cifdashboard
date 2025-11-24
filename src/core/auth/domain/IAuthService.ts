/**
 * Authentication Service Interface
 * Domain layer interface for authentication operations
 * Following Clean Architecture - presentation layer depends on this interface
 */

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface IAuthService {
  /**
   * Get the currently authenticated user
   * @returns User object or null if not authenticated
   */
  getCurrentUser(): User | null;

  /**
   * Login with Google OAuth
   * @returns Promise resolving to authenticated user
   * @throws Error if login fails
   */
  loginWithGoogle(): Promise<User>;

  /**
   * Logout the current user
   * @throws Error if logout fails
   */
  logout(): Promise<void>;

  /**
   * Subscribe to authentication state changes
   * @param callback - Function called when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
