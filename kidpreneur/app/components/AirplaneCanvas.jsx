"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Airplane from "./Airplane";
const AirplaneCanvas = () => {
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY > 110 ? 110 : window.scrollY / 2);
    };

    // window.addEventListener("wheel", handleWheel, { passive: false    });
    window.addEventListener("scroll", handleScroll);

    return () => {
      //   window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      style={{
        width: "800px",
        height: "400px",
        position: "absolute",
        right: "-45vh",
        bottom: "-20vh",
        marginBottom: `${scrollY * 5}px`,
        marginRight: `${scrollY * 7}px`,
        transition: "all 0.5s ease-out",
      }}
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Airplane scale={1} position={[5, -4, 0]} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default AirplaneCanvas;
