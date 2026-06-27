"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Earth from "./Earth";

const EarthCanvas = () => {
  return (
    <div
      style={{
        width: "100vw", // Full viewport width
        height: "100vh", // Full viewport height
        transition: "all 0.5s ease-out",
        zIndex: 1000,
        overflow: "hidden", // Prevent scrollbars if Earth expands
        // position: "absolute",
        marginTop: "-47vh",
        rotate: 180 + "deg",
      }}
    >
      <Canvas camera={{ position: [0, 3, 8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          color={0xffe0b2}
        />
        <Earth scale={4} /> {/* Increased scale */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default EarthCanvas;
