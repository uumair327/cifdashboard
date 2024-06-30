import { useState } from 'react';
import Carousel from './components/Carousel';
import HomeImages from './components/HomeImages';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content flex">
        <Sidebar />
        <div className="content-area p-8">
          <Carousel />
          <HomeImages />
        </div>
      </div>
    </div>
  );
};

export default App;
