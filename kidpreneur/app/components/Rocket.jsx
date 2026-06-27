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
