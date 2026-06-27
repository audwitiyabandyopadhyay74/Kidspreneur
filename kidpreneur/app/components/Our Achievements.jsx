import React from "react";

const OurAchivements = () => {
  return (
    <div className="w-screen h-[200vh] flex flex-col justify-center items-center bg-black rounded-2xl text-white">
      <span className="headings text-5xl font-bold font-[cursive] a after:bg-amber-500">
        Our Achievements
      </span>
      <div className="achievements">
        <div className="paths">
          <div className="path w-[50vh] h-[30vh] border-20 border-white border-l-transparent  scale-90 rounded-r-[150%] rounded-t-[-150%]  ">
            <div
              className="achievement text-3xl font-bold text-white flex items-center justify-center text-center max-w-[27vh]  mt-[10%] ml-[5%]"
              style={{ padding: "1rem" }}
            >
              Award For The Best Entrepreneurs
              <div
                className="year mr-[-100%]  font-bold top-[50%] bg-white rounded-full w-15 h-15 flex items-center text-[20px] justify-center text-black"
                style={{ padding: "1rem" }}
              >
                2020
              </div>
            </div>
          </div>
          <div className="path w-[50vh] h-[30vh] border-20 border-t-20 border-white   border-r-transparent rounded-l-[150%] rounded-t-[0%] mt-[-10%] bg-black ml-[-350px]">
            <div
              className="achievement text-3xl font-bold text-white flex items-center justify-center text-center max-w-[27vh]  mt-[10%] ml-[5%]"
              style={{ padding: "1rem" }}
            >
              {" "}
              <div
                className="year ml-[-40%]  font-bold top-[50%] bg-white rounded-full w-15 h-15 flex items-center text-[20px] justify-center text-black"
                style={{ padding: "1rem" }}
              >
                2021
              </div>
              The Best Startup
            </div>
          </div>
          <div className="path w-[50vh] h-[30vh] border-20 border-t-20 border-white   border-l-transparent rounded-r-[150%] rounded-t-[0%] mt-[-5%] bg-black mr-[-378px]">
            <div
              className="achievement text-3xl font-bold text-white flex items-center justify-center text-center max-w-[27vh]  mt-[10%] ml-[5%] mr-[-378px]"
              style={{ padding: "1rem" }}
            >
              {" "}
              Award For The Best Entrepreneur
              <div
                className="year mr-[-100%]  font-bold top-[50%] bg-white rounded-full w-15 h-15 flex items-center text-[20px] justify-center text-black"
                style={{ padding: "1rem" }}
              >
                2022
              </div>
            </div>
          </div>
        </div>
        <div className="path w-[50vh] h-[30vh] border-20 border-t-20 border-white   border-r-transparent rounded-l-[150%] rounded-t-[0%] mt-[-5%] bg-black ml-[-350px]">
          <div
            className="achievement text-3xl font-bold text-white flex items-center justify-center text-center max-w-[27vh]  mt-[10%] ml-[5%]"
            style={{ padding: "1rem" }}
          >
            {" "}
            <div
              className="year ml-[-40%]  font-bold top-[50%] bg-white rounded-full w-15 h-15 flex items-center text-[20px] justify-center text-black"
              style={{ padding: "1rem" }}
            >
              2023
            </div>
            The Best Startup
          </div>
        </div>
        <div className="path w-[50vh] h-[30vh] border-20 border-t-20 border-white scale-90  border-l-transparent rounded-r-[150%] rounded-t-[-150%]  mt-[-8%] ml-[-50px]">
          <div
            className="achievement capitalize text-3xl font-bold text-white flex items-center justify-center text-center  mt-[10%] mr-[5%]"
            style={{ padding: "1rem" }}
          >
            Unicorn (Valuated more than a bilion)
            <div
              className="year mr-[-25%]  font-bold top-[50%] bg-white rounded-full w-15 h-15 flex items-center text-[20px] justify-center text-black"
              style={{ padding: "1rem" }}
            >
              2024
            </div>
          </div>
        </div>
        <div className="path w-[50vh] h-[30vh] border-20 border-t-20 border-white   border-r-transparent rounded-l-[150%] rounded-t-[0%] mt-[-8.5%] bg-black ml-[-330px]"></div>
      </div>
    </div>
  );
};

export default OurAchivements;
