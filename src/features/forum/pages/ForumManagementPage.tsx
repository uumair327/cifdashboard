/**
 * Forum Management Page
 * Comprehensive forum management matching Flutter app structure
 */

import { useState, useMemo } from 'react';
import { FirebaseForumRepository } from '../data/repositories/FirebaseForumRepository';
import { useForum } from '../hooks/useForum';
import { ForumCategory } from '../domain/entities/Forum';
import { ForumList } from '../components/ForumList';
import { ForumForm } from '../components/ForumForm';
import { useAuth } from '../../../core/auth';
import { LuPlus } from 'react-icons/lu';

export default function ForumManagementPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>('parent');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const repository = useMemo(() => new FirebaseForumRepository(), []);
  const { forums, loading, error } = useForum(repository, selectedCategory);

  const handleCreateForum = async (title: string, description: string) => {
    if (!user) return;
    
    try {
      await repository.createForum(title, description, selectedCategory, user.uid);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating forum:', err);
    }
  };

  const handleDeleteForum = async (forumId: string) => {
    if (!confirm('Are you sure you want to delete this forum post and all its comments?')) {
      return;
    }

    try {
      await repository.deleteForum(forumId);
    } catch (err) {
      console.error('Error deleting forum:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Forum Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage forum posts and discussions
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LuPlus size={20} />
          New Forum Post
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setSelectedCategory('parent')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            selectedCategory === 'parent'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Parent Forums
        </button>
        <button
          onClick={() => setSelectedCategory('children')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            selectedCategory === 'children'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Children Forums
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <ForumForm
          onSubmit={handleCreateForum}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Forum List */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error loading forums: {error.message}
          </p>
        </div>
      )}

      <ForumList
        forums={forums}
        loading={loading}
        repository={repository}
        onDelete={handleDeleteForum}
      />
    </div>
  );
}
