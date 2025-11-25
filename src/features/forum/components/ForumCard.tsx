/**
 * Forum Card Component
 * Displays a single forum post with comments
 */

import { useState, useEffect } from 'react';
import { Forum, UserDetails } from '../domain/entities/Forum';
import { IForumRepository } from '../domain/repositories/IForumRepository';
import { useComments } from '../hooks/useComments';
import { CommentList } from './CommentList';
import { LuMessageSquare, LuTrash2, LuChevronDown, LuChevronUp, LuUser } from 'react-icons/lu';

interface ForumCardProps {
  forum: Forum;
  repository: IForumRepository;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (forumId: string) => Promise<void>;
}

export function ForumCard({ forum, repository, isExpanded, onToggleExpand, onDelete }: ForumCardProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const { comments, loading: commentsLoading } = useComments(repository, isExpanded ? forum.id : null);

  useEffect(() => {
    repository.getUserDetails(forum.userId).then(setUserDetails);
  }, [forum.userId, repository]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Forum Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {userDetails?.userImage ? (
              <img
                src={userDetails.userImage}
                alt={userDetails.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <LuUser className="w-5 h-5 text-slate-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {forum.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{userDetails?.userName || 'Loading...'}</span>
                <span>•</span>
                <span>{formatDate(forum.createdAt)}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  {forum.category}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(forum.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete forum post"
          >
            <LuTrash2 size={18} />
          </button>
        </div>

        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {forum.description}
        </p>

        {/* Comments Toggle */}
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium"
        >
          <LuMessageSquare size={16} />
          <span>{comments.length} Comments</span>
          {isExpanded ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
        </button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <CommentList
            forumId={forum.id}
            comments={comments}
            loading={commentsLoading}
            repository={repository}
          />
        </div>
      )}
    </div>
  );
}
