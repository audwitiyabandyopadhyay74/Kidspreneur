import React from "react";
import About from "../components/About";
import Footer from "../components/Footer";
import Bridge from "../components/BridgeCanvas";
import Founders from "../components/Founders";
import RocketCanvas1 from "../components/RocketCanvas1";
import OurAchivements from "../components/Our Achievements";
import Counter from "../components/Counter";

const AboutPage = () => {
  return (
    <>
      <About />
      <RocketCanvas1 />
      {/* <Bridge /> */}
      <Counter />
      <Founders />
      <OurAchivements />
      <Footer />
    </>
  );
};

export default AboutPage;
