/**
 * Firebase implementation of ICollectionRepository
 * Handles all Firestore operations for collection data
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../../../firebase';
import { ICollectionRepository } from '../../domain/repositories/ICollectionRepository';
import { SearchCriteria } from '../../domain/entities/Search';
import { BaseCollection } from '../../domain/entities/Collection';
import { DashboardError, DashboardErrors } from '../../../../core/errors/DashboardError';
import { logger } from '../../../../core/utils/logger';

/**
 * Firebase repository implementation for collections
 * @template T The entity type extending BaseCollection
 */
export class FirebaseCollectionRepository<T extends BaseCollection>
  implements ICollectionRepository<T> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Convert Firestore document to domain entity
   */
  private docToEntity(id: string, data: DocumentData): T {
    return {
      ...data,
      id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as T;
  }

  /**
   * Convert domain entity to Firestore document data
   */
  private entityToDoc(item: Partial<T>): DocumentData {
    const { id, createdAt, updatedAt, ...rest } = item as any;

    const doc: DocumentData = { ...rest };

    if (createdAt instanceof Date) {
      doc.createdAt = Timestamp.fromDate(createdAt);
    }
    if (updatedAt instanceof Date) {
      doc.updatedAt = Timestamp.fromDate(updatedAt);
    }

    return doc;
  }

  async getAll(): Promise<T[]> {
    try {
      logger.debug(`[FirebaseRepo] Fetching all from collection: ${this.collectionName}`);
      const collectionRef = collection(db, this.collectionName);
      const snapshot = await getDocs(collectionRef);
      logger.debug(`[FirebaseRepo] Found ${snapshot.docs.length} documents in ${this.collectionName}`);

      const results = snapshot.docs.map(doc => this.docToEntity(doc.id, doc.data()));
      logger.debug(`[FirebaseRepo] Mapped ${results.length} results for ${this.collectionName}`);
      return results;
    } catch (error) {
      logger.error(`Error fetching all from ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `fetch all ${this.collectionName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.docToEntity(docSnap.id, docSnap.data());
    } catch (error) {
      logger.error(`Error fetching document ${id} from ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `fetch ${this.collectionName} by ID`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...this.entityToDoc(item as Partial<T>),
        createdAt: now,
        updatedAt: now,
      };

      const collectionRef = collection(db, this.collectionName);
      const docRef = await addDoc(collectionRef, docData);

      // Fetch the created document to return complete entity
      const createdDoc = await getDoc(docRef);
      return this.docToEntity(createdDoc.id, createdDoc.data()!);
    } catch (error) {
      logger.error(`Error creating document in ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `create ${this.collectionName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    try {
      const docRef = doc(db, this.collectionName, id);

      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw DashboardErrors.notFound(this.collectionName, id);
      }

      const updateData = {
        ...this.entityToDoc(item),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      // Fetch updated document
      const updatedDoc = await getDoc(docRef);
      return this.docToEntity(updatedDoc.id, updatedDoc.data()!);
    } catch (error) {
      if (error instanceof DashboardError) {
        throw error;
      }
      logger.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `update ${this.collectionName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      logger.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `delete ${this.collectionName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      // Firestore batch has a limit of 500 operations
      const batchSize = 500;

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchIds = ids.slice(i, i + batchSize);

        batchIds.forEach(id => {
          const docRef = doc(db, this.collectionName, id);
          batch.delete(docRef);
        });

        await batch.commit();
      }
    } catch (error) {
      logger.error(`Error bulk deleting from ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `bulk delete ${this.collectionName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async search(criteria: SearchCriteria): Promise<T[]> {
    try {
      // Get all items first (Firestore has limited query capabilities)
      const items = await this.getAll();

      // Apply search filtering in memory
      let filtered = items;

      // Apply text search if query provided
      if (criteria.query && criteria.fields.length > 0) {
        const lowerQuery = criteria.query.toLowerCase();
        filtered = filtered.filter(item => {
          return criteria.fields.some(field => {
            const value = (item as any)[field];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(lowerQuery);
          });
        });
      }

      // Apply filters
      if (criteria.filters && criteria.filters.length > 0) {
        filtered = filtered.filter(item => {
          return criteria.filters.every(filter => {
            const value = (item as any)[filter.field];
            if (value === null || value === undefined) return false;

            const strValue = String(value).toLowerCase();
            const filterValue = String(filter.value).toLowerCase();

            switch (filter.operator) {
              case 'equals':
                return strValue === filterValue;
              case 'contains':
                return strValue.includes(filterValue);
              case 'startsWith':
                return strValue.startsWith(filterValue);
              case 'endsWith':
                return strValue.endsWith(filterValue);
              case 'gt':
                return Number(value) > Number(filter.value);
              case 'lt':
                return Number(value) < Number(filter.value);
              default:
                return false;
            }
          });
        });
      }

      return filtered;
    } catch (error) {
      if (error instanceof DashboardError) {
        throw error;
      }
      logger.error(`Error searching in ${this.collectionName}:`, error);
      throw DashboardErrors.operationFailed(
        `search ${this.collectionName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  subscribe(
    onData: (items: T[]) => void,
    onError: (error: Error) => void
  ): () => void {
    logger.debug(`[FirebaseRepo] Setting up real-time listener for: ${this.collectionName}`);

    const collectionRef = collection(db, this.collectionName);

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        logger.debug(`[FirebaseRepo] Real-time update for ${this.collectionName}: ${snapshot.docs.length} documents`);
        const items = snapshot.docs.map(doc => this.docToEntity(doc.id, doc.data()));
        onData(items);
      },
      (error) => {
        logger.error(`[FirebaseRepo] Real-time listener error for ${this.collectionName}:`, error);
        onError(error);
      }
    );

    return () => {
      logger.debug(`[FirebaseRepo] Unsubscribing from ${this.collectionName}`);
      unsubscribe();
    };
  }
}
