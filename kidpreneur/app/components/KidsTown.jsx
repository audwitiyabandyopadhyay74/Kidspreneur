"use client";
import React, { useRef, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const KidsTown = (props) => {
  const { scene } = useGLTF("/low_poly_island.glb");
  const ref = useRef();
  const [scrollPos, setScrollPos] = useState(22);



  // Smooth scroll-driven rotation

  // Continuous rotation animation
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005; // slow spin
    }
  });

  // Initial setup after model load
  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(1.2, 1.2, 1.2);
      ref.current.position.y = -0.5;
      ref.current.rotation.set(0, Math.PI * 0.15, 0);
    }
  }, []);

  return <primitive ref={ref} object={scene.clone()} {...props} />;
};

export default KidsTown;
