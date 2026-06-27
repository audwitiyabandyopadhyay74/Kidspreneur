"use client";
import React from "react";
// import { FaChalkboardTeacher } from 'react-icons/fa';
// import { FaGlobe } from 'react-icons/fa6';
// import { FaMoneyBill1Wave } from 'react-icons/fa6';
import { Dataoffeature } from "../Data/dataoffeatures";
console.log(Dataoffeature);
const WhyToGetStarted = () => {
  return (
    <div
      className="w-screen h-[200vh] flex flex-col items-center justify-center "
      style={{ padding: "2rem" }}
    >
      <span
        className="text-5xl font-bold rounded-2xl bg-gray-200"
        style={{ padding: "2rem" }}
      >
        Why To Get Started From Here
      </span>
      <hr className="lines w-[10px] h-[40vw] bg-black rounded-md z-10" />
      <div
        className="box w-[50vw] h-[20vw] border-t-[10px] border-r-[10px] mt-[-30%]  border-l-[10px] z-100"
        style={{ borderRadius: "30px" }}
      ></div>
      <div className="flex w-[90%] h-[90%] items-center justify-center  gap-[5%] z-100 mt-[-40%] flex-wrap">
        {Dataoffeature.map((d) => (
          <div
            key={d.id}
            className="box h-[35vw] w-[30%] bg-gray-200 rounded-4xl flex flex-col items-center justify-center font-bold capitalize  hover:translate-y-10 "
          >
            <div className="w-[100%] h-[50%] flex items-center justify-center text-7xl">
              <i className={`${d.icon} `}></i>
            </div>
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyToGetStarted;
55;
