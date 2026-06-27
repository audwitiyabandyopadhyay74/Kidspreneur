import React from "react";
import { useGLTF } from "@react-three/drei";
const Airplane = (props) => {
  const { scene } = useGLTF("/airplance_wood_toy.glb");

  // Set desired rotation
  scene.rotation.set(0, Math.PI / -2, 0);

  // Convert current transform into baked matrix
  scene.updateMatrix();
  scene.matrixAutoUpdate = false; // stop future changes
  return <primitive object={scene} {...props} />;
};

export default Airplane;
