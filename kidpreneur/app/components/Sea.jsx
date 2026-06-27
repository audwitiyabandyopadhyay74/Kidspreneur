// Sea.js
import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Sea(props) {
  const { scene } = useGLTF("/The ocean6 Perfect loop fork 8.glb"); // adjust path to your model

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: "blue",       // solid blue
          roughness: 0.3,      // slightly shiny
          metalness: 0.1
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    }); 
  }, [scene]);

  return <primitive object={scene} {...props} />;
}
