import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import HomePage from "./pages/HomePage";
import MommyPage from "./pages/MommyPage";
import GCornerPage from "./pages/GCornerPage";
import DiveDeepPage from "./pages/DiveDeepPage";
import WritersJointPage from "./pages/WritersJointPage";
import CoffeeJointPage from "./pages/CoffeeJointPage";
import EscapePage from "./pages/EscapePage";
import VisionBoardPage from "./pages/VisionBoardPage";
import ChillWithYouPage from "./pages/ChillWithYouPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/posu-corner" element={<MommyPage />} />
          <Route path="/lg-corner" element={<GCornerPage />} />
          <Route path="/memory-lane" element={<DiveDeepPage />} />
          <Route path="/writers-joint" element={<WritersJointPage />} />
          <Route path="/coffee-joint" element={<CoffeeJointPage />} />
          <Route path="/escape" element={<EscapePage />} />
          <Route path="/escape/vision-board" element={<VisionBoardPage />} />
          <Route path="/chill-with-you" element={<ChillWithYouPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
