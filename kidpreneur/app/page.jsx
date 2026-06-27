import React from "react";
import Banner from "./components/Banner";
import DontLimitYourselfForAge from "./components/Don't Limit Yourself For Age";
import AlreadyRegistered from "./components/AlreadyRegistered";
import WhyToGetStarted from "./components/WhyToGetStarted";
import LetsGetStarted from "./components/LetsGetStarted";
import Footer from "./components/Footer";
// import TrainCanvas from "./components/TrainCanavas";
// import AirplaneCanvas from "./components/AirplaneCanvas";
// import RocketCanvas from "./components/RocketCanvas";

const Page = () => {
  return (
    <div className="min-h-screen max-max">
      <Banner />
      <DontLimitYourselfForAge />
      <AlreadyRegistered />
      <WhyToGetStarted />
      <LetsGetStarted />
      <Footer />
      {/* <TrainCanvas /> */}
    </div>
  );
};

export default Page;
