/**
 * useComments Hook
 * Custom hook for forum comments
 */

import { useState, useEffect } from 'react';
import { Comment } from '../domain/entities/Forum';
import { IForumRepository } from '../domain/repositories/IForumRepository';

export function useComments(repository: IForumRepository, forumId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!forumId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = repository.getComments(
      forumId,
      (updatedComments) => {
        setComments(updatedComments);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [repository, forumId]);

  return { comments, loading, error };
}
