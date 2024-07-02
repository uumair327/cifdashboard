import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

const Displayer = ({ collectionName }) => {
  const [collectionItems, setCollectionItems] = useState([]);

  useEffect(() => {
    const getCollectionItems = async () => {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollectionItems(items);
    };

    getCollectionItems();
  }, [collectionName]);

  return (
    <div className="w-full">
      <div className="text-3xl mb-6">Items</div>
      <div>
        {collectionItems.map((item) => {
          return (
            <div className=" bg-slate-800 mb-8 rounded">
              {Object.entries(item).map((pair) => {
                return (
                  <div className="flex flex-col">
                    <div className="text-xl bg-slate-700 p-2 rounded-t">{`${pair[0]}`}</div>
                    <div className="p-4 break-words">{pair[1]}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Displayer;
