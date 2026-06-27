"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGLTF, Center } from "@react-three/drei";

const Rocket = (props) => {
  const { scene } = useGLTF("/rocket.glb");
  return (
    <Center>
      {" "}
      {/* recenters geometry to 0,0,0 */}
      <primitive object={scene} {...props} />
    </Center>
  );
};

const RocketCanvas = () => {
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY - 200 > 110 ? 110 : window.scrollY - 200 / 2);
    };

    // window.addEventListener("wheel", handleWheel, { passive: false    });
    window.addEventListener("scroll", handleScroll);

    return () => {
      //   window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const offset = 800; // starting offset in px

  return (
    <div
      style={{
        width: "800px",
        height: "400px",
        position: "absolute",
        bottom: 0,
        transform: `translateY(${offset - scrollY * 2}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 70 }}
        style={{ marginBottom: scrollY * 5 + "px" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Centered and scaled */}
        <group position={[0, 0, 0]} scale={[1, 1, 1]}>
          <Rocket />
        </group>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default RocketCanvas;
