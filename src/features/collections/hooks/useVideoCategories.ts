/**
 * useVideoCategories Hook
 * Fetches unique video categories from Firebase
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import { logger } from '../../../core/utils/logger';

export function useVideoCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const videosRef = collection(db, 'videos');
        const q = query(videosRef);
        const snapshot = await getDocs(q);

        // Extract unique categories
        const categorySet = new Set<string>();
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.category && typeof data.category === 'string') {
            categorySet.add(data.category);
          }
        });

        // Convert to sorted array
        const uniqueCategories = Array.from(categorySet).sort();
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        logger.error('Error fetching video categories:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
