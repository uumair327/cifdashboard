import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const HomeImagesItem = ({
  homeImagesItem,
  setHomeImagesItems,
  homeImagesItems,
}) => {
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, "carousel_items", itemId));
      // Update the homeImagesItems state after deleting
      const updatedItems = homeImagesItems.filter((item) => item.id !== itemId);
      setHomeImagesItems(updatedItems);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="bg-neutral-700 p-4 rounded flex flex-col gap-4 max-w-[500px] items-center">
      <div className="flex gap-2 w-[80%]">
        <p className=" font-bold">Link:</p>
        <a href={homeImagesItem.url} className="">
          {homeImagesItem.url}
        </a>
      </div>
      <img className="w-[400px] rounded" src={homeImagesItem.image} />
      <button
        className="bg-red-600 px-4 py-2 rounded self-start"
        onClick={() => handleDeleteItem(item.id)}
      >
        Delete
      </button>
    </div>
  );
};

const HomeImages = () => {
  const [homeImagesItems, setHomeImagesItems] = useState([]);

  useEffect(() => {
    const getHomeImagesItems = async () => {
      const querySnapshot = await getDocs(collection(db, "home_images"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHomeImagesItems(items);
    };

    getHomeImagesItems();
  }, []);

  const handleAddItem = async () => {
    // Prompt the user for new item data (e.g., image URL, title)
    const newItemData = {
      // ... new item data
    };

    try {
      await addDoc(collection(db, "home_images"), newItemData);
      // Update the homeImagesItems state after adding
      const updatedItems = [...homeImagesItems, newItemData];
      setHomeImagesItems(updatedItems);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between">
        <h2 className="text-3xl mb-4">Home Images</h2>
        <button
          className="bg-green-600 rounded py-2 px-4 text-xl mb-4"
          onClick={handleAddItem}
        >
          Add Item
        </button>
      </div>
      <div className="flex flex-wrap gap-8 justify-center">
        {homeImagesItems.map((item, index) => (
          <HomeImagesItem
            key={index}
            homeImagesItem={item}
            setHomeImagesItems={setHomeImagesItems}
            homeImagesItems={homeImagesItems}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeImages;
