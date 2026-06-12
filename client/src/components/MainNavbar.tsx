import React from "react";
import { useLocation } from "react-router-dom";

const MainNavbar = () => {
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  return (
    <nav className="w-screen bg-white h-fit flex flex-col overflow-hidden  fixed top-0  right-0">
      <div className="w-full flex items-center justify-between lg:py-3 px-2 lg:px-12">
        <div className="flex items-center justify-center gap-3">
          <h3 className="font-bold text-black text-2xl">BOTIKA</h3>

          {["Topics", "Reviews"].map((item) => (
            <span
              key={item}
              className="ml-8 lg:block hidden text-semibold text-[17px] text-[#0c0c0c] hover:text-[#666] transition-colors duration-300 cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            className="
        w-11 h-11
        rounded-full
        bg-[#313131]
        text-white
        font-semibold
        hover:bg-[#424242]
        transition-colors duration-300
      "
          >
            M
          </button>
        </div>
      </div>

      {isDashboard && (
        <div className="bg-[#F3EBFF] w-full h-9 flex items-center justify-center">
          <p className="text-[16px] text-[#0c0c0c] font-medium">
            Welcome Back, Madana! Explore new topics and enhance your skills
            with our personalized learning platform.
          </p>
        </div>
      )}
    </nav>
  );
};

export default MainNavbar;
