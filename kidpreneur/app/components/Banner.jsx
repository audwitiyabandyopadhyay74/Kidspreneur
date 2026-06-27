"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// import Airplane from "./Airplane";
// import ToyTrain from "./ToyTrain";
import TrainCanvas from "./TrainCanavas";
import TownCanvas from "./TrainCanavas";
import AirplaneCanvas from "./AirplaneCanvas";

const Banner = () => {
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
      setScrollY(window.scrollY > 110 ? 110 : window.scrollY / 2);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="max-w-screen h-[100vh] flex items-center justify-center flex-col relative">
      {/* Title */}
      <span className="text-7xl text-amber-500 font-[cursive] w-screen h-screen flex items-center justify-center z-100 absolute">
        Welcome To Kidpreneur
      </span>

      {/* Airplane */}
      {/* <AirplaneCanvas /> */}

      {/* Color Blocks */}
      {/* <div className="absolute w-[400px] h-[400px] bottom-0 left-0 z-10">
        <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />

          <mesh position={[0, 0, 0]} scale={[2, 2, 2]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="yellow" />
          </mesh>

          <mesh position={[-1, 5, 5]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="red" />
          </mesh>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </div> */}

      {/* Toy Train */}
      <TrainCanvas />
      {/* KidsTown */}
      {/* <TownCanvas /> */}
    </div>
  );
};

export default Banner;
