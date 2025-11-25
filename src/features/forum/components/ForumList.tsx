/**
 * Forum List Component
 * Displays list of forum posts with comments
 */

import { useState } from 'react';
import { Forum } from '../domain/entities/Forum';
import { IForumRepository } from '../domain/repositories/IForumRepository';
import { ForumCard } from './ForumCard';
import { LuLoader2 } from 'react-icons/lu';

interface ForumListProps {
  forums: Forum[];
  loading: boolean;
  repository: IForumRepository;
  onDelete: (forumId: string) => Promise<void>;
}

export function ForumList({ forums, loading, repository, onDelete }: ForumListProps) {
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LuLoader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (forums.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          No forum posts found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {forums.map((forum) => (
        <ForumCard
          key={forum.id}
          forum={forum}
          repository={repository}
          isExpanded={expandedForumId === forum.id}
          onToggleExpand={() => setExpandedForumId(expandedForumId === forum.id ? null : forum.id)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
