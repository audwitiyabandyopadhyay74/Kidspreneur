"use client";
import React, { useEffect, useRef, useState } from "react";

const AlreadyRegistered = () => {
  const [scrollY, setScrollY] = useState(0);
  const targetScroll = useRef(0);
  const canvas = useRef();

  // Smooth scroll interpolation
  const smoothScrollTo = (targetY, duration = 1000) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) requestAnimationFrame(animateScroll);
    };

    requestAnimationFrame(animateScroll);
  };

  // Listen to normal scroll + smooth wheel scroll
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault(); // disable native jumpy scroll
      targetScroll.current += e.deltaY;
      targetScroll.current = Math.max(0, targetScroll.current); // clamp to top
      smoothScrollTo(targetScroll.current, 500); // ease to new scroll target
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
      console.log(window.scrollY);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // console.log(window.scrollY);

  const offset = 400;

  return (
    <div className="w-screen h-screen flex justify-center items-center rounded-4xl bg-blue-400">
      <h1 className="text-6xl font-bold text-white w-[45%] h-[80%] flex justify-center items-center capitalize">
        The list of those. who didn't stop them for age
      </h1>
      <div className="h-[80%] max-h-max w-[45%] flex items-center justify-center">
        <div
          className="h-[95%] w-[70%] bg-white rounded-4xl overflow-auto"
          style={{
            transform: `translateY(${offset - scrollY / 4}px)`,
            transition: "transform 0.5s ease-out",
          }}
          ref={canvas}
        >
          <ul className="h-full w-full flex flex-col overflow-auto">
            {/* Header Row */}
            <li
              className="w-full p-4 h-[20%] hover:bg-gray-200 rounded-t-4xl rounded-2xl flex items-center justify-between fixed bg-white"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Name
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Age
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Ideas
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Country
              </span>
            </li>

            {/* Data Rows */}
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between mt-[20%]"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Durga
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                14
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Ai Programer
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                India
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Gitanjali Rao
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                15
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Water testing device
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                India
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Harshita
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                13
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Restarting The Vedic ways To Teach
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                India
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Jordan
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                12
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Coding for kids
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                UK
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Aarav
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                10
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Mini drone delivery
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                India
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Zara
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                16
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Mental health app
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Canada
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-200 rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Kabir
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                11
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Smart compost bin
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                India
              </span>
            </li>
            <li
              className="w-full p-4 h-[10%] hover:bg-gray-200 rounded-b-4xl rounded-2xl flex items-center justify-between"
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Lina
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                17
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Solar-powered backpack
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
                Germany
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlreadyRegistered;
