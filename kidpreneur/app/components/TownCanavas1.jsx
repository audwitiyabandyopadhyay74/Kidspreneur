"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Town from "./KidsTown1";
const TownCanvas = ({ props, bottom, left, right, scale }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: props || "absolute",
        transition: "all 0.5s ease-out",
        zIndex: 100,
        marginBottom: bottom || 0,
        marginLeft: left || 0,
        marginRight: right,
        scale: scale,
        overflow: "visible",
      }}
    >
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          color={0xffe0b2}
        />
        <Town scale={2} />
        <OrbitControls enableZoom={false} enableRotate />
      </Canvas>
    </div>
  );
};

export default TownCanvas;
