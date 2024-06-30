import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const CarouselItem = ({ carouselItem, setCarouselItems, carouselItems }) => {
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, "carousel_items", itemId));
      // Update the carouselItems state after deleting
      const updatedItems = carouselItems.filter((item) => item.id !== itemId);
      setCarouselItems(updatedItems);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="bg-neutral-700 p-4 rounded flex flex-col gap-4">
      <a
        href={carouselItem.link}
        className=""
      >{`Link: ${carouselItem.link}`}</a>
      <img className="w-[400px]" src={carouselItem.imageUrl} />
      <button
        className="bg-red-600 px-4 py-2 rounded self-start"
        onClick={() => handleDeleteItem(item.id)}
      >
        Delete
      </button>
    </div>
  );
};

const Carousel = () => {
  const [carouselItems, setCarouselItems] = useState([]);

  useEffect(() => {
    const getCarouselItems = async () => {
      const querySnapshot = await getDocs(collection(db, "carousel_items"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCarouselItems(items);
    };

    getCarouselItems();
  }, []);

  const handleAddItem = async () => {
    // Prompt the user for new item data (e.g., image URL, title)
    const newItemData = {
      // ... new item data
    };

    try {
      await addDoc(collection(db, "carousel_items"), newItemData);
      // Update the carouselItems state after adding
      const updatedItems = [...carouselItems, newItemData];
      setCarouselItems(updatedItems);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between">
        <h2 className="text-3xl mb-4">Carousel Items</h2>
        <button
          className="bg-green-600 rounded py-2 px-4 text-xl mb-4"
          onClick={handleAddItem}
        >
          Add Item
        </button>
      </div>
      <div className="flex flex-wrap gap-8 justify-center">
        {carouselItems.map((item, index) => (
          <CarouselItem
            key={index}
            carouselItem={item}
            setCarouselItems={setCarouselItems}
            carouselItems={carouselItems}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
