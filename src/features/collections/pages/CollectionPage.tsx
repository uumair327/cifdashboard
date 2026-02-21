/**
 * CollectionPage component
 * Main page for managing a collection with full CRUD operations
 */
import { useState } from 'react';
import { CollectionTableWithSearch } from '../components/CollectionTableWithSearch';
import { CollectionForm, FormFieldConfig } from '../components/CollectionForm';
import { ImportModal } from '../components/ImportModal';
import { Modal } from '../../../core/components/Modal/Modal';
import { useToast } from '../../../core/components/Toast/ToastProvider';
import { BaseCollection, CollectionType } from '../domain/entities/Collection';
import { useCollection } from '../hooks/useCollection';
import { useCollectionMutations } from '../hooks/useCollectionMutations';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { logger } from '../../../core/utils/logger';

interface CollectionPageProps<T extends BaseCollection> {
  collectionType: CollectionType;
  title: string;
  formFields: FormFieldConfig[];
  repository: ICollectionRepository<T>;
}

export function CollectionPage<T extends BaseCollection>({
  collectionType,
  title,
  formFields,
  repository,
}: CollectionPageProps<T>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<T | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | undefined>();

  const { addToast } = useToast();

  // Fetch collection data
  const { data, loading, error, refetch } = useCollection<T>(repository, collectionType);
  logger.debug('[CollectionPage] data from useCollection:', data?.length, 'items');

  // Mutations
  const { create, update, deleteItem, bulkDelete, creating, updating, deleting, bulkDeleting } =
    useCollectionMutations<T>(repository, {
      collectionName: collectionType,
      onSuccess: () => refetch(),
      onProgress: (current, total) => {
        setBulkProgress({ current, total });
      },
    });

  const isLoading = creating || updating || deleting || bulkDeleting;

  // Handle add new
  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  // Handle edit
  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = (item: T) => {
    setDeleteConfirmItem(item);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;

    try {
      await deleteItem(deleteConfirmItem.id);
      addToast('success', `Item deleted successfully`);
      setDeleteConfirmItem(null);
    } catch (err) {
      addToast('error', `Failed to delete item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async (items: T[]) => {
    try {
      await bulkDelete(items.map(item => item.id));
      addToast('success', `${items.length} items deleted successfully`);
      setSelectedIds([]);
    } catch (err) {
      addToast('error', `Failed to delete items: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData: Partial<T>) => {
    try {
      if (editingItem) {
        // Update existing item
        await update(editingItem.id, formData);
        addToast('success', 'Item updated successfully');
      } else {
        // Create new item
        await create(formData as Omit<T, 'id' | 'createdAt' | 'updatedAt'>);
        addToast('success', 'Item created successfully');
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      addToast('error', `Failed to save item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Handle import
  const handleImport = async (items: Partial<T>[]) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          await create(item as Omit<T, 'id' | 'createdAt' | 'updatedAt'>);
          successCount++;
        } catch (err) {
          errorCount++;
          logger.error('Failed to import item:', err);
        }
      }

      if (successCount > 0) {
        addToast('success', `Successfully imported ${successCount} items`);
      }
      if (errorCount > 0) {
        addToast('error', `Failed to import ${errorCount} items`);
      }

      setIsImportOpen(false);
      refetch();
    } catch (err) {
      addToast('error', `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Get required and optional fields from formFields
  const requiredFields = formFields.filter(f => f.required).map(f => f.name);
  const optionalFields = formFields.filter(f => !f.required).map(f => f.name);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="flex gap-3">
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <svg
              className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Import
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* Collection Table */}
      <CollectionTableWithSearch
        collectionType={collectionType}
        data={data}
        loading={loading}
        error={error}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRetry={refetch}
        bulkLoading={isLoading}
        bulkProgress={bulkProgress}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <CollectionForm
          collectionType={collectionType}
          fields={formFields}
          initialData={editingItem || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={isLoading}
          submitLabel={editingItem ? 'Update' : 'Create'}
        />
      </Modal>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        requiredFields={requiredFields}
        optionalFields={optionalFields}
        collectionName={title}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmItem}
        onClose={() => setDeleteConfirmItem(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteConfirmItem(null)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
