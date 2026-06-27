"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";
const ToyTrain = (props) => {
  const { scene } = useGLTF("/wooden_toy_train.glb");
  return <primitive object={scene} {...props} />;
};

export default ToyTrain;
