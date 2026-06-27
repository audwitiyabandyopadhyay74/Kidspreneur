"use client";
import ToyTrain from "./ToyTrain";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Airplane from "./Airplane";
import AirplaneCanvas from "./AirplaneCanvas";
import TownCanvas from "./TownCanavas";

const TrainCanavas = () => {
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY > 110 ? 110 : window.scrollY / 2);
    };

    // window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      //   window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "400px",
          position: "absolute",
          right: "-50vh",
          bottom: "-20vh",
          marginRight: `${scrollY * 7}px`,
          transition: "all 0.5s ease-out",
          zIndex: 200,
          background: "transparent",
        }}
      >
        <Canvas camera={{ position: [0, 0, 15], fov: 100 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <ToyTrain position={[0, 0, 0]} />
          <OrbitControls enableZoom={false} minDistance={540} />
        </Canvas>
      </div>
      <AirplaneCanvas />
      <TownCanvas />
    </>
  );
};

export default TrainCanavas;
