"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Rocket from "./Rocket1";
const RocketCanvas = () => {
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY > 110 ? 110 : window.scrollY / 2);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
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
        marginRight: `${scrollY * 8}px`,
        transition: "all 0.5s ease-out",
      }}
      className="rotate-y-[30deg]"
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <group rotation={[0, 0, Math.PI / 4]}>
          <Rocket scale={1} position={[5, -4, 0]} />
        </group>
        <OrbitControls enableZoom={false} minDistance={22} />
      </Canvas>
    </div>
  );
};

export default RocketCanvas;
