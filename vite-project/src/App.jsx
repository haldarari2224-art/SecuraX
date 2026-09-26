import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Upload from "./components/Upload";
import Analysis from "./components/Analysis";
import Reports from "./components/Reports";
import History from "./components/History";
import Settings from "./components/Settings";
import View from "./components/View";
import Security from "./components/Security";
import Insights from "./components/Insights";
import About from "./components/About";


import { SettingsProvider } from "./context/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/view" element={<View />} />
          <Route path="/security" element={<Security />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </SettingsProvider>
  );
}

export default App;