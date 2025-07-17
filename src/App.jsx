import { BrowserRouter, Routes, Route } from 'react-router';

import TabsBar from "./components/TabsBar.jsx";
import Home from './pages/home';

function App() {

  return (
      <>
          <BrowserRouter>
              <TabsBar />
              <Routes>
                  <Route path="*" element={<Home />} />
              </Routes>
          </BrowserRouter>
      </>
  )
}

export default App
