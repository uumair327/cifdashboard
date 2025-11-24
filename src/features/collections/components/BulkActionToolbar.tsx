/**
 * BulkActionToolbar component
 * Provides bulk actions for selected items in collections
 */
import { useState } from 'react';
import { BaseCollection } from '../domain/entities/Collection';
import { ProgressBar } from '../../../core/components/ProgressBar/ProgressBar';

interface BulkActionToolbarProps<T extends BaseCollection> {
  selectedItems: T[];
  onBulkDelete?: (items: T[]) => void;
  onClearSelection?: () => void;
  loading?: boolean;
  progress?: { current: number; total: number };
}

export function BulkActionToolbar<T extends BaseCollection>({
  selectedItems,
  onBulkDelete,
  onClearSelection,
  loading = false,
  progress,
}: BulkActionToolbarProps<T>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCount = selectedItems.length;

  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedItems);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      {/* Progress Bar */}
      {progress && progress.total > 0 && (
        <div className="mb-4">
          <ProgressBar
            current={progress.current}
            total={progress.total}
            label="Deleting items..."
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        {/* Selection Info */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={loading}
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Delete Action */}
          {onBulkDelete && (
            <div className="relative">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600">
                    Delete {selectedCount} item{selectedCount !== 1 ? 's' : ''}?
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Deleting...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
