import { BrowserRouter, Routes, Route } from 'react-router';

import Layout from "./components/Layout";
import Home from './pages/home';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="*" element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
