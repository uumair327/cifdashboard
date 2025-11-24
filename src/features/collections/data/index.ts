/**
 * Data Layer Barrel Export
 * Exports only what the presentation layer should use
 */

// Export factory for dependency injection
export { RepositoryFactory, createRepository } from './factories/RepositoryFactory';

// Export repository interface (not implementation)
export type { ICollectionRepository } from '../domain/repositories/ICollectionRepository';

// Note: We do NOT export FirebaseCollectionRepository directly
// This enforces the dependency inversion principle
