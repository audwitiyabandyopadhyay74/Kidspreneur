"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Text3D } from "@react-three/drei";
import Rocket from "./RocketCanvas"; // Rocket is now a mesh/group, not a separate Canvas
import "@/app/globals.css";

const DontLimitYourselfForAge = () => {
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
    <div className="w-screen h-screen flex flex-col  items-center justify-center ">
      <div
        className="w-screen absolute h-screen flex flex-col  items-center justify-center "
        style={{ marginRight: `-${scrollY * 0.01}` }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ width: "100%" }}
        >
          {/* 🌟 Lighting */}
          <ambientLight intensity={1} />
          <directionalLight position={[1, 1, 1]} intensity={1} />

          {/* 🧠 Motivational Text */}
          <Center>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.4}
              height={0.1} // instead of 0.5
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.0005}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
              rotation={[0, 0, 0]}
              // position={[0, Math.sin(scrollY * 0.01) * 0.5, 0]}
            >
              Stop Limiting Yourself For Age
            </Text3D>
            <meshStandardMaterial color="#0000" />
          </Center>

          {/* 🚀 Rocket Model */}

          {/* 🕹️ Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
      <Rocket />
    </div>
  );
};

export default DontLimitYourselfForAge;
