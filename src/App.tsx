import { BrowserRouter, Routes, Route } from "react-router-dom";
import InfoMapShell from "./pages/InfoMapShell";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoMapShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
