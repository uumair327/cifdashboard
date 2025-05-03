import React, { useState, useCallback, memo } from "react";
import { useCollectionData } from "../hooks/useCollectionData";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";

interface DisplayerProps {
  collectionName: string;
}

const ItemCard = memo(({ item, onDelete }: { item: any; onDelete: (id: string) => void }) => (
  <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
    <div className="p-4">
      {Object.entries(item).map(([key, value]) => (
        key !== 'id' && (
          <div key={key} className="mb-3 last:mb-0">
            <div className="text-sm text-slate-400 mb-1">{key}</div>
            <div className="text-white break-words">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        )
      ))}
    </div>
    <div className="bg-slate-700 p-4 flex justify-end">
      <button
        onClick={() => onDelete(item.id)}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        <FiTrash2 />
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
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
      <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-3xl">Items</div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
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