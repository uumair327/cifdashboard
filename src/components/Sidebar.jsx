import React from "react";

const SideBarCard = ({
  name,
  collection,
  selectedCollectionName,
  setSelectedCollectionName,
}) => {
  return (
    <div
      onClick={() => setSelectedCollectionName(collection)}
      className={`${
        collection == selectedCollectionName ? "bg-slate-700" : "bg-slate-800"
      } p-4 rounded cursor-pointer`}
    >
      <div className="text-2xl">{name}</div>
    </div>
  );
};

const Sidebar = ({ selectedCollectionName, setSelectedCollectionName }) => {
  return (
    <div className="flex-[0.3] flex flex-col gap-4 bg-slate-900 p-4 rounded overflow-y-auto h-full">
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
        name="Quizes"
        collection="quizes"
        selectedCollectionName={selectedCollectionName}
        setSelectedCollectionName={setSelectedCollectionName}
      />
      <SideBarCard
        name="Quiz Question"
        collection="quiz_questions"
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
