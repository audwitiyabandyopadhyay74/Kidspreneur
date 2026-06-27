import React from "react";
import Founder from "./Founder";
import { dataoffounders } from "../Data/dataoffounders";

const Founders = () => {
  return (
    <div className="max-w-screen max-h-screen  ">
      <div className="child max-h-[80vh] flex items-center justify-center  gap-4  scroll-auto">
        {dataoffounders.map((props) => (
          <Founder {...props} key={props.id} />
        ))}
      </div>
    </div>
  );
};

export default Founders;
