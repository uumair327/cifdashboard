/**
 * Comment Item Component
 * Displays a single comment
 */

import { useState, useEffect } from 'react';
import { Comment, UserDetails } from '../domain/entities/Forum';
import { IForumRepository } from '../domain/repositories/IForumRepository';
import { LuTrash2, LuUser } from 'react-icons/lu';

interface CommentItemProps {
  comment: Comment;
  repository: IForumRepository;
  onDelete: () => Promise<void>;
}

export function CommentItem({ comment, repository, onDelete }: CommentItemProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    repository.getUserDetails(comment.userId).then(setUserDetails);
  }, [comment.userId, repository]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    await onDelete();
  };

  return (
    <div className="flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {userDetails?.userImage ? (
        <img
          src={userDetails.userImage}
          alt={userDetails.userName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <LuUser className="w-4 h-4 text-slate-500" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {userDetails?.userName || 'Loading...'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm break-words">
          {comment.text}
        </p>
      </div>

      <button
        onClick={handleDelete}
        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
        title="Delete comment"
      >
        <LuTrash2 size={14} />
      </button>
    </div>
  );
}
