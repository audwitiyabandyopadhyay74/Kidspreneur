
"use client";
import React, { useEffect, useRef } from "react";
import { Canvas,meshStandardMaterial} from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Sea from "./Sea";

const SeaCanvas = () => {
  const [scrollY, setScrollY] = React.useState(0);

  useEffect(() => {
    // Fix for GLB texture blob issue
 
    const handleScroll = () => {
      setScrollY(window.scrollY > 110 ? 110 : window.scrollY / 2);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        zIndex:-1,
        width: "100%",
        height: "25vh",
        right: "0",
        bottom: "0",
        transition: "all 0.5s ease-out",
        display: "flex",        
        alignItems: "center",
        justifyContent: "center",
        marginTop:"45%"    ,
        position:"fixed"
      }}
    >
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }} shadows>
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        {/* Sea model with forced meshPhysicalMaterial */}
        <Sea scale={2} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="blue"      
          />
        </Sea>

        <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default SeaCanvas;
