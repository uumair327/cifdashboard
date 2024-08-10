import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Displayer from "../components/Displayer";
import Adder from "../components/Adder";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { LuLogOut } from "react-icons/lu";
import { logoutGoogle } from "../firebaseAuth";

const App: React.FC = () => {
  const [selectedCollectionName, setSelectedCollectionName] =
    useState<string>("carousel_items");

  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user == null) {
        navigate("/login");
      }
    });
  }, []);

  const isMobile = () => window.innerWidth <= 768;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-slate-900 h-[10%] flex justify-between items-center">
        <div className="text-3xl">CIF Guardian Care</div>
        <button onClick={() => logoutGoogle()} className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded text-xl hover:scale-[1.02] hover:-translate-y-1 duration-300">
          <LuLogOut/>
          <span>Logout</span>
        </button>
      </div>
      <div
        className={`p-4 max-md:p-2 flex ${
          isMobile() ? "flex-col" : "flex-row"
        } justify-between h-[90%] gap-4 max-md:gap-2`}
      >
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
