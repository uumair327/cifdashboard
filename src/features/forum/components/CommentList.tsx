/**
 * Comment List Component
 * Displays and manages comments for a forum post
 */

import { useState } from 'react';
import { Comment } from '../domain/entities/Forum';
import { IForumRepository } from '../domain/repositories/IForumRepository';
import { CommentItem } from './CommentItem';
import { useAuth } from '../../../core/auth';
import { LuSend, LuLoader2 } from 'react-icons/lu';
import { logger } from '../../../core/utils/logger';

interface CommentListProps {
  forumId: string;
  comments: Comment[];
  loading: boolean;
  repository: IForumRepository;
}

export function CommentList({ forumId, comments, loading, repository }: CommentListProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      await repository.addComment(forumId, newComment, user.uid);
      setNewComment('');
    } catch (error) {
      logger.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {submitting ? <LuLoader2 className="w-4 h-4 animate-spin" /> : <LuSend size={16} />}
          <span>Send</span>
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LuLoader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              repository={repository}
              onDelete={() => repository.deleteComment(forumId, comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
