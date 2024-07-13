import React, { useState, useEffect } from "react";
import { getDocs, collection, DocumentData, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

interface DisplayerProps {
  collectionName: string;
}

interface CollectionItem extends DocumentData {
  id: string;
}

const Displayer: React.FC<DisplayerProps> = ({ collectionName }) => {
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    const getCollectionItems = async () => {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CollectionItem[];
      setCollectionItems(items);
    };

    getCollectionItems();
  }, [collectionName]);

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, collectionName, itemToDelete));
        setCollectionItems(items => items.filter(item => item.id !== itemToDelete));
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  return (
    <div className="w-full">
      <div className="text-3xl mb-6">Items</div>
      <div>
        {collectionItems.map((item) => (
          <div key={item.id} className="bg-slate-800 mb-8 rounded">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <div className="text-xl bg-slate-700 p-2 rounded-t">{key}</div>
                <div className="p-4 break-words">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
            <button 
              onClick={() => handleDelete(item.id)} 
              className="bg-red-500 text-white p-2 rounded m-4"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-black mb-4">Are you sure you want to delete this item?</p>
            <div className="flex justify-end">
              <button 
                onClick={confirmDelete} 
                className="bg-red-500 text-white p-2 rounded mr-2"
              >
                Confirm
              </button>
              <button 
                onClick={cancelDelete} 
                className="bg-gray-300 text-black p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Displayer;