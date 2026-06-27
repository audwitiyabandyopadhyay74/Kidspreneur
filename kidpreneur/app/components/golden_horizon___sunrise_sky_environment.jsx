"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";

// Custom sunrise sky environment component
const GoldenHorizonSunriseSkyEnvironment = (props) => {
  // Load the GLB scene from the public folder
  const { scene } = useGLTF("./scene.glb");

  // Optionally, you can add custom props or logic here
  // For example, you could add rotation, scale, or animation

  return <primitive object={scene} {...props} />;
};

export default GoldenHorizonSunriseSkyEnvironment;
