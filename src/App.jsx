import { useState } from 'react'
import Carousel from './components/Carousel'
import HomeImages from './components/HomeImages'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div className='p-8'>
      <Carousel/>
      <HomeImages/>
    </div>
  )
}

export default App
