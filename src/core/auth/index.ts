/**
 * Auth Module Barrel Export
 * Exports public API for authentication
 */

// Domain interfaces
export type { IAuthService, User } from './domain/IAuthService';

// Context and hooks
export { AuthProvider, useAuth } from './context/AuthProvider';

// Data layer implementation (for initialization only)
export { FirebaseAuthService } from './data/FirebaseAuthService';
