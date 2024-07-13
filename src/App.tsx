import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Displayer from "./components/Displayer";
import Adder from "./components/Adder";

const App: React.FC = () => {
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>(
    "carousel_items"
  );

  // Media Query to detect mobile screen size
  const isMobile = () => window.innerWidth <= 768; // Adjust breakpoint if needed

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-slate-900 h-[10%] flex items-center">
        <div className="text-3xl">CIF Guardian Care</div>
      </div>
      <div className={`p-4 max-md:p-2 flex ${isMobile() ? "flex-col" : "flex-row"} justify-between h-[90%] gap-4 max-md:gap-2`}>
        {isMobile() ? (
          <>
            <Sidebar
              selectedCollectionName={selectedCollectionName}
              setSelectedCollectionName={setSelectedCollectionName}
            />
            <div className="flex-[0.5] flex-grow overflow-y-auto">
              <div className="flex flex-col gap-4">
                <Adder collectionName={selectedCollectionName} />
                <Displayer collectionName={selectedCollectionName} />
              </div>
            </div>
          </>
        ) : (
          <>
            <Sidebar
              selectedCollectionName={selectedCollectionName}
              setSelectedCollectionName={setSelectedCollectionName}
            />
            <div className="flex-[0.7] bg-slate-900 p-4 rounded h-full flex gap-4">
              <div className="flex-[0.5]">
                <Adder collectionName={selectedCollectionName} />
              </div>
              <div className="h-full w-[2px] bg-slate-800" />
              <div className="flex-[0.5] overflow-y-auto">
                <Displayer collectionName={selectedCollectionName} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
