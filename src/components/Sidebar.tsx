import React from "react";
import { useLocation } from "react-router-dom";

interface SideBarCardProps {
  name: string;
  collection: string;
  selectedCollectionName: string;
  setSelectedCollectionName: (collection: string) => void;
}

const SideBarCard: React.FC<SideBarCardProps> = ({
  name,
  collection,
  selectedCollectionName,
  setSelectedCollectionName,
}) => {
  const isSelected = collection === selectedCollectionName;

  return (
    <button
      onClick={() => setSelectedCollectionName(collection)}
      className={`
        w-full text-left
        ${isSelected
          ? "bg-slate-200 dark:bg-slate-700 ring-2 ring-blue-500"
          : "bg-slate-100 dark:bg-slate-800"
        } 
        p-3 md:p-4 rounded-lg cursor-pointer 
        transition-all duration-200 ease-in-out
        hover:bg-slate-200 dark:hover:bg-slate-700 
        active:bg-slate-300 dark:active:bg-slate-600
        active:scale-[0.98]
        shadow-sm hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="text-base md:text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
        {name}
        {isSelected && (
          <span className="ml-auto text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
};

interface SidebarProps {
  selectedCollectionName: string;
  setSelectedCollectionName: (collection: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCollectionName, setSelectedCollectionName }) => {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-2 md:gap-3 overflow-y-auto h-full" aria-label="Main navigation">
      <SideBarCard
        name="Carousel Items"
        collection="carousel_items"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
      <SideBarCard
        name="Home Images"
        collection="home_images"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
      <SideBarCard
        name="Forum"
        collection="forum"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
      <SideBarCard
        name="Learn"
        collection="learn"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
      <SideBarCard
        name="Quiz"
        collection="quiz"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
      <SideBarCard
        name="Videos"
        collection="videos"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
    </nav>
  );
};

export default Sidebar;