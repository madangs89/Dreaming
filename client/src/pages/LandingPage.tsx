import React from "react";

import HeroImage from "../assets/heroimage.png";

const LandingPage = () => {
  return (
    <div className="w-full relative h-full  overflow-hidden px-12 p-7 ">
      <div
        style={{
          zIndex: 90,
        }}
        className="w-1/2 absolute right-0 top-0 p-12 h-full  "
      >
        <img
          src={HeroImage}
          alt="Hero"
          className="w-full h-full object-cover  rounded-lg shadow-lg"
        />
      </div>
      <div
        style={{
          fontFamily: "helveticRoman",
          zIndex: 100,
        }}
        className="w-full relative h-fit mt-28"
      >
        <p
          style={{
            letterSpacing: "-0.288rem",
            color: "#0c0c0c",
          }}
          className="text-7xl w-1/2 flex flex-col "
        >
          <span
            style={{
              letterSpacing: "-0.112rem",
              color: "#666",
            }}
          >
            Ai fashion models
          </span>{" "}
          trusted by world-class
          <br /> fashion brands
        </p>

        <p
          className="my-6 w-2/5 text-[15px]"
          style={{
            fontFamily: "helveticRoman",
            letterSpacing: "0.1rem",
            color: "#666",
          }}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident
          earum nihil, error quas magnam rerum quam.
        </p>

        <div className="flex items-center gap-4 mt-6">
          <button
            className="px-8 py-3 bg-[#313131]
                      tracking-[0.1rem]
          font-semibold
          text-white rounded-md text-[14px]  hover:bg-[#424242] transition-colors duration-300"
          >
            Get Started
          </button>
          <button
            className="px-8 py-3 bg-[#dbdbdb]
            tracking-[0.1rem]
          font-[600]
          text-black rounded-md text-[14px]  hover:bg-[#BFBFBF] transition-colors duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
