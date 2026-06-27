"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EarthCanvas from "./EarthCanvas";

const LetsGetStarted = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      router.push("/create-idea");
    } else {
      router.push("/auth/signup");
    }
  };
  return (
        <div className="w-screen h-screen bg-black rounded-4xl flex items-center justify-center text-white flex-col">
    <div className="w-full h-max bg-black rounded-4xl flex items-center justify-center text-white flex-col mt-[20%] bg-transparent gap-4">
      <span className="font-bold text-7xl z-0">
        Lets Get Started
      </span>
      <button onClick={handleClick} className="w-[20vh] mt-4 hover:translate-y-[-10px] cursor-pointer h-[7vh] bg-white text-black rounded-md z-1100 ">{isLoggedIn ? "Create Idea" : "Sign Up!"}</button>
</div>
      <EarthCanvas style={{ scale: 2 }} />
    </div>
  );
};

export default LetsGetStarted;
