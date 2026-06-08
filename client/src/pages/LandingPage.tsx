import { useState } from "react";
import HeroImage from "../assets/heroimage.png";
import HeroVedio from "../assets/herovedio.mp4";
import LoginPage from "./LoginPage";

const LandingPage = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="w-full relative h-full flex items-center   overflow-hidden lg:px-12 p-7 ">
      <nav
        style={{
          fontFamily: "helveticRoman",
          zIndex: 100,
        }}
        className="w-full h-fit flex overflow-hidden lg:px-12 items-center justify-between absolute top-3 right-0 px-2"
      >
        <div className="flex items-center justify-center gap-3">
          <h3 className="font-bold  text-black text-2xl">BOTIKA</h3>
          {["Home", "Features", "Pricing", "Contact"].map((item) => (
            <span
              key={item}
              className="ml-8 :block hidden text-[15px] text-[#0c0c0c] hover:text-[#666] transition-colors duration-300 cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>

        <div onClick={() => setOpen(true)} className="flex items-center gap-4">
          <button
            className="px-8 py-3 bg-[#313131]
                      tracking-[0.1rem]
          font-semibold
          text-white rounded-md text-[14px]  hover:bg-[#424242] transition-colors duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div
        style={{
          fontFamily: "helveticRoman",
          zIndex: 100,
        }}
        className="w-full flex md:h-[500px] my-5 relative h-fit md:mt-10"
      >
        <div className="flex-1 my-auto flex-shrink-0 mt-12 lg:mt-8">
          {" "}
          <p
            style={{
              letterSpacing: "-0.288rem",
              color: "#0c0c0c",
            }}
            className="text-7xl  w-full flex flex-col "
          >
            <span
              style={{
                letterSpacing: "-0.112rem",
                color: "#666",
              }}
            >
              You learn it.
            </span>{" "}
            We make sure you
            <br /> remember it.
          </p>
          <p
            className="my-6 w-full lg:text-[15px] text-[10px]"
            style={{
              fontFamily: "helveticRoman",
              letterSpacing: "0.1rem",
              color: "#666",
            }}
          >
            Every article you read, every video you watch, every course you take
            — most of it disappears within days. We captures everything you
            learn, builds your revision schedule, and makes sure it actually
            sticks."
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

        <div
          style={{
            zIndex: 90,
          }}
          className="w-1/2 h-full lg:block hidden"
        >
          <video
            src={HeroVedio}
            autoPlay
            loop
            muted
            className="w-full h-[450px] object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      <LoginPage open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default LandingPage;
