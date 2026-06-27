"use client";
import React from "react";

const Counter = () => {
  const [counter1, setCounter1] = React.useState(0);
  const [counter2, setCounter2] = React.useState(0);
  const [counter3, setCounter3] = React.useState(0);
  React.useEffect(() => {
    // for (let i; i === 100; i++) {
    //   setCounter1(i);
    //   console.log(i);
    // }
    // setInterval(() => {
    //   if (counter1 === 100) {
    //     return setCounter1(counter1);
    //   } else {
    //     return setCounter1(counter1 + 1);
    //   }
    // }, 1000);
  }, []);
  setInterval(() => {
    return setCounter1((prev) => (prev === 100 ? prev : prev + 1));
  }, 100);
  setInterval(() => {
    return setCounter2((prev) => (prev === 10 ? prev : prev + 1));
  }, 100);
  setInterval(() => {
    return setCounter3((prev) => (prev === 100 ? prev : prev + 1));
  }, 100);

  return (
    <div
      className="w-screen h-[30vh] flex items-center justify-center"
      style={{ padding: "1rem" }}
    >
      <div className="w-[80%] h-[100%] bg-gray-200 rounded-4xl flex items-center justify-center p-1">
        <div className="ideas flex flex-col h-full w-[25%] items-center justify-evenly">
          <span className="text-2xl font-semibold text-gray-700">Ideas</span>
          <span className="text-5xl font-bold text-black">{counter1}+</span>
        </div>
        <div className="ideas flex flex-col h-full w-[25%] items-center justify-evenly">
          <span className="text-2xl font-semibold text-gray-700 capitalize text-center">
            Total Funding Raised for the ideas
          </span>
          <span className="text-5xl font-bold text-black">
            ₹{counter2} Lacs+{" "}
          </span>
        </div>
        <div className="ideas flex flex-col h-full w-[25%] items-center justify-evenly">
          <span className="text-2xl font-semibold text-gray-700">
            Happy Kids
          </span>
          <span className="text-5xl font-bold text-black">{counter3}+</span>
        </div>
      </div>
    </div>
  );
};

export default Counter;
