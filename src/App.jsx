import { useState } from "react";
import Carousel from "./components/Carousel";
import HomeImages from "./components/HomeImages";
import Sidebar from "./components/Sidebar";
import Displayer from "./components/Displayer";

const App = () => {
  const [selectedCollectionName, setSelectedCollectionName] = useState('carousel_items');

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-slate-900 h-[10%] flex items-center">
        <div className="text-3xl">CIF Guardian Care</div>
      </div>
      <div className="p-4 flex justify-between h-[90%]">
        <Sidebar selectedCollectionName={selectedCollectionName} setSelectedCollectionName={setSelectedCollectionName} />
        <div className="flex-[0.69] bg-slate-900 p-4 rounded h-full flex gap-4">
          <div className="flex-[0.5]">

          </div>
          <div className=" h-full w-[2px] bg-slate-800"/>
          <div className="flex-[0.5] overflow-y-auto">
            <Displayer collectionName={selectedCollectionName}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
