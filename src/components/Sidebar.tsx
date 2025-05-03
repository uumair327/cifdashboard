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
      className={`${collection === selectedCollectionName ? "bg-slate-700" : "bg-slate-800"
        } p-4 max-md:p-2 rounded cursor-pointer`}
    >
      <div className="text-2xl max-md:text-lg">{name}</div>
    </div>
  );
};

interface SidebarProps {
  selectedCollectionName: string;
  setSelectedCollectionName: (collection: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCollectionName, setSelectedCollectionName }) => {
  return (
    <div className="flex-[0.3] flex flex-col gap-4 bg-slate-900 p-4 max-md:p-2 max-md:gap-2 rounded overflow-y-auto h-full">
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