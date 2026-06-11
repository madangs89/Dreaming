import React from "react";
import MainNavbar from "../components/MainNavbar";
import { Outlet } from "react-router-dom";
import Topic from "../modules/topic/Topic";

const Dashboard = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <MainNavbar />
      <div className="w-full h-full lg:pt-24 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
