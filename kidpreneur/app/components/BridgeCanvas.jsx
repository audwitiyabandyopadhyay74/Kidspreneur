"use client";

import React from "react";
import Town from "./TownCanavas1";
import Bridger from "./Bridge";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
const BridgeCanvas = () => {
  return (
    <div
      className="flex items-center justify-center   max-w-[100vh] mt-[-60vh] z-0"
      style={{ padding: "1rem" }}
    >
      <Town props={"relative"} bottom={"0vh"} right={"-170vh"} />

      <div className="flex items-center justify-center z-110 ml-[45vh] relative w-screen h-screen">
        <Canvas
          camera={{ position: [0, 3, 10], fov: 50 }}
          style={{ width: "210vh", height: "50vh" }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.2}
            color={0xffe0b2}
          />
          <Bridger />
          <OrbitControls
            enableZoom={false}
            minDistance={20}
            // maxDistance={12}
            enableRotate={false}
          />
        </Canvas>
      </div>
      <Town left={"-110vh"} props={"relative"} bottom={"0vh"} />

      {/* <Town props={"relative"} /> */}
    </div>
  );
};

export default BridgeCanvas;
