import React, { useState, useCallback, memo } from "react";
import { useCollectionData } from "../hooks/useCollectionData";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";

interface DisplayerProps {
  collectionName: string;
}

const ItemCard = memo(({ item, onDelete }: { item: any; onDelete: (id: string) => void }) => (
  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
    <div className="p-3 md:p-4">
      {Object.entries(item).map(([key, value]) => (
        key !== 'id' && (
          <div key={key} className="mb-2 md:mb-3 last:mb-0">
            <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1">{key}</div>
            <div className="text-sm md:text-base text-slate-900 dark:text-white break-words">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        )
      ))}
    </div>
    <div className="bg-slate-200 dark:bg-slate-700 p-3 md:p-4 flex justify-end">
      <button
        onClick={() => onDelete(item.id)}
        className="flex items-center gap-1 md:gap-2 bg-red-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded hover:bg-red-600 transition-colors text-sm md:text-base"
      >
        <FiTrash2 size={16} className="md:size-5" />
        Delete
      </button>
    </div>
  </div>
));

const DeleteModal = memo(({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-slate-900 dark:text-white">Confirm Delete</h3>
      <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-4 md:mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
      <div className="flex justify-end gap-3 md:gap-4">
        <button
          onClick={onCancel}
          className="px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded hover:bg-red-600 transition-colors text-sm md:text-base"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
));

const Displayer: React.FC<DisplayerProps> = ({ collectionName }) => {
  const { data: collectionItems, loading, error, refetch, deleteItem } = useCollectionData(collectionName);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDelete = useCallback((id: string) => {
    setItemToDelete(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteItem]);

  const cancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-3 md:p-4 text-sm md:text-base">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 mb-4 md:mb-6">
        <div className="text-xl md:text-3xl text-slate-900 dark:text-white">Items</div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 md:gap-2 bg-blue-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded hover:bg-blue-600 transition-colors text-sm md:text-base"
        >
          <FiRefreshCw size={16} className={`md:size-5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:gap-4">
        {collectionItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {itemToDelete && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default memo(Displayer);