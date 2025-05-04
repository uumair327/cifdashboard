import React from "react";

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
  return (
    <div
      onClick={() => setSelectedCollectionName(collection)}
      className={`
        ${collection === selectedCollectionName
          ? "bg-slate-200 dark:bg-slate-700"
          : "bg-slate-100 dark:bg-slate-800"
        } 
        p-3 md:p-4 rounded cursor-pointer 
        transition-colors 
        hover:bg-slate-200 dark:hover:bg-slate-700 
        active:bg-slate-300 dark:active:bg-slate-600
      `}
    >
      <div className="text-lg md:text-xl font-medium text-slate-900 dark:text-white">{name}</div>
    </div>
  );
};

interface SidebarProps {
  selectedCollectionName: string;
  setSelectedCollectionName: (collection: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCollectionName, setSelectedCollectionName }) => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 overflow-y-auto h-full">
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
    </div>
  );
};

export default Sidebar;