import { useState, useEffect, useCallback, useRef } from 'react';
import { getDocs, collection, DocumentData, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CacheItem {
  data: DocumentData[];
  timestamp: number;
  unsubscribe?: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: Record<string, CacheItem> = {};

export const useCollectionData = (collectionName: string) => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const lastFetchTime = useRef<number>(0);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      
      // Check cache first
      const cachedData = cache[collectionName];
      const now = Date.now();
      
      if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        setData(cachedData.data);
        setLoading(false);
        return;
      }

      // If we're fetching too frequently, use cached data
      if (now - lastFetchTime.current < 1000) { // 1 second debounce
        if (cachedData) {
          setData(cachedData.data);
          setLoading(false);
          return;
        }
      }

      lastFetchTime.current = now;

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          if (!isMounted.current) return;

          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Update cache
          cache[collectionName] = {
            data: items,
            timestamp: now,
            unsubscribe,
          };

          setData(items);
          setError(null);
          setLoading(false);
        },
        (err) => {
          if (!isMounted.current) return;
          setError(err instanceof Error ? err : new Error('An error occurred'));
          setLoading(false);
        }
      );

      // Store unsubscribe function in cache
      if (cache[collectionName]) {
        cache[collectionName].unsubscribe?.();
      }
      cache[collectionName] = {
        data: [],
        timestamp: now,
        unsubscribe,
      };

    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setLoading(false);
    }
  }, [collectionName]);

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      // The real-time listener will handle the update
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'));
    }
  };

  const updateItem = async (id: string, newData: any) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, newData);
      // The real-time listener will handle the update
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update item'));
      throw err;
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
      // Clean up real-time listener when component unmounts
      if (cache[collectionName]?.unsubscribe) {
        cache[collectionName].unsubscribe();
      }
    };
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(true), 
    deleteItem,
    updateItem,
  };
}; 