// Repository interface for collection data access

import { SearchCriteria } from '../entities/Search';

/**
 * Generic repository interface for collection CRUD operations
 * @template T The entity type for this repository
 */
export interface ICollectionRepository<T> {
  /**
   * Retrieve all items from the collection
   * @returns Promise resolving to array of items
   */
  getAll(): Promise<T[]>;

  /**
   * Retrieve a single item by ID
   * @param id The unique identifier
   * @returns Promise resolving to the item or null if not found
   */
  getById(id: string): Promise<T | null>;

  /**
   * Create a new item in the collection
   * @param item The item data (without id)
   * @returns Promise resolving to the created item with id
   */
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Update an existing item
   * @param id The unique identifier
   * @param item Partial item data to update
   * @returns Promise resolving to the updated item
   */
  update(id: string, item: Partial<T>): Promise<T>;

  /**
   * Delete an item by ID
   * @param id The unique identifier
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Delete multiple items by their IDs
   * @param ids Array of unique identifiers
   * @returns Promise resolving when all deletions are complete
   */
  bulkDelete(ids: string[]): Promise<void>;

  /**
   * Search for items matching criteria
   * @param criteria Search parameters
   * @returns Promise resolving to array of matching items
   */
  search(criteria: SearchCriteria): Promise<T[]>;

  /**
   * Subscribe to real-time updates for all items in the collection
   * @param onData Callback invoked with updated data
   * @param onError Callback invoked when an error occurs
   * @returns Unsubscribe function to stop listening
   */
  subscribe(
    onData: (items: T[]) => void,
    onError: (error: Error) => void
  ): () => void;
}
