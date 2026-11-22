
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import InfoMapShell from "./pages/InfoMapShell";
import MemoryMapShell from "./pages/MemoryMapShell";

function MapSwitcher() {
  const [activeMap, setActiveMap] = useState<"explorer" | "memory">(
    "explorer"
  );

  return (
    <>
      {activeMap === "explorer" && (
        <InfoMapShell
          onOpenMemoryMap={() => setActiveMap("memory")}
        />
      )}

      {activeMap === "memory" && (
        <MemoryMapShell
          onBack={() => setActiveMap("explorer")}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapSwitcher />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
