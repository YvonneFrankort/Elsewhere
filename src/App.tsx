import { BrowserRouter, Routes, Route } from "react-router-dom";
import InfoMapPage from "./pages/InfoMapPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoMapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
