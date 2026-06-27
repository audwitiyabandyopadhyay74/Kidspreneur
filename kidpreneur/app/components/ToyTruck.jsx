"use client";
import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const ToyTruck = (props) => {
  const { scene } = useGLTF("/wood_truck_toy.glb");

  useEffect(() => {
    // Apply rotation to all meshes inside the GLTF
    scene.traverse((child) => {
      if (child.isMesh) {
        child.rotation.set(0, 1.9764189148834006, 0); // Y rotation in radians
      }
    });

    // Optional: bake the transform so it doesn't get overridden
    scene.updateMatrix();
    scene.matrixAutoUpdate = false;
  }, [scene]);

  return <primitive object={scene} {...props} />;
};

export default ToyTruck;
