import React from "react";

const MainNavbar = () => {
  return (
    <nav className="w-screen bg-white h-fit flex overflow-hidden lg:px-12 items-center justify-between fixed top-0 lg:py-3 right-0 px-2">
      <div className="flex items-center justify-center gap-3">
        <h3 className="font-bold text-black text-2xl">BOTIKA</h3>

        {["Topics", "Reviews"].map((item) => (
          <span
            key={item}
            className="ml-8 lg:block hidden text-[15px] text-[#0c0c0c] hover:text-[#666] transition-colors duration-300 cursor-pointer"
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
    </nav>
  );
};

export default MainNavbar;
