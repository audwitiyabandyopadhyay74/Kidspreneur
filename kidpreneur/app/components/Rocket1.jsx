import { useGLTF, Center } from "@react-three/drei";

const Rocket = (props) => {
  const { scene } = useGLTF("/rocket.glb");
  //   scene.rotation.z = 3;

  // Convert current transform into baked matrix
  scene.updateMatrix();
  scene.matrixAutoUpdate = false; // stop future changes
  return (
    <Center>
      {" "}
      {/* recenters geometry to 0,0,0 */}
      <primitive object={scene} {...props} />
    </Center>
  );
};

export default Rocket;
