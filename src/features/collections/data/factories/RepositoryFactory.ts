/**
 * Repository Factory
 * Provides dependency injection for repositories following Clean Architecture
 */
import { ICollectionRepository } from '../../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../../domain/entities/Collection';
import { FirebaseCollectionRepository } from '../repositories/FirebaseCollectionRepository';

/**
 * Factory class for creating repository instances
 * This abstracts the concrete implementation from the presentation layer
 */
export class RepositoryFactory {
  /**
   * Creates a collection repository for the specified collection type
   * @param collectionName - The name of the Firebase collection
   * @returns Repository instance implementing ICollectionRepository
   */
  static createCollectionRepository<T extends BaseCollection>(
    collectionName: string
  ): ICollectionRepository<T> {
    return new FirebaseCollectionRepository<T>(collectionName);
  }
}

/**
 * Convenience function for creating repositories
 * This can be easily mocked for testing
 */
export const createRepository = <T extends BaseCollection>(
  collectionName: string
): ICollectionRepository<T> => {
  return RepositoryFactory.createCollectionRepository<T>(collectionName);
};
