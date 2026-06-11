import React from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { Route, Routes } from "react-router-dom";
import Protected from "./ProtectedRoutes/Protected";
import Topic from "./modules/topic/Topic";

const App = () => {
  return (
    <div className="bg-white h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        >
          <Route path="/dashboard" element={<Topic />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
