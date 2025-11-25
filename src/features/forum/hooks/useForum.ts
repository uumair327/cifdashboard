/**
 * useForum Hook
 * Custom hook for forum operations
 */

import { useState, useEffect } from 'react';
import { Forum, ForumCategory } from '../domain/entities/Forum';
import { IForumRepository } from '../domain/repositories/IForumRepository';

export function useForum(repository: IForumRepository, category: ForumCategory) {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = repository.getForums(
      category,
      (updatedForums) => {
        setForums(updatedForums);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [repository, category]);

  return { forums, loading, error };
}
