"use client";
import React from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Island from "./Island2";
import Sea from "./Sea";


const IslandCanvas2 = () => {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY > 110 ? 110 : window.scrollY / 2);
    };
    // Add this at the very top of your component file


    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        width:"100%" ,
        height: "100vh",
        marginLeft:"-150vh",
        // left: "0",
        // bottom: "-20vh",
        // marginRight: `${scrollY * 5}px`,
        transition: "all 0.5s ease-out",
        display: "flex",
        alignItems: "left",
        justifyContent: "left",
        position:"fixed",
        zIndex:-1,
        marginTop:" 7%"
      }}
    >
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }} style={{width:"100%",height:"150vh"}}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Island scale={2} position={[0, 0, 0]} />
        {/* <Sea scale={2}  position={[0,0,0]}/> */}
        {/* Lock rotation so truck stays fixed */}
        <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} minDistance={10} />
      </Canvas>
    </div>
  );
};

export default IslandCanvas2;
