import React from "react";

type SpinnerProps = {
  size?: number;
};

const Spinner = ({ size = 18 }: SpinnerProps) => {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-black"
      style={{
        width: size,
        height: size,
      }}
    />
  );
};

export default Spinner;
