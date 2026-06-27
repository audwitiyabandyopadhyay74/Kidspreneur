import React from "react";
import Image from "next/image";

const Founder = (props) => {
  return (
    <div
      className="min-h-[80vh] max-h-[80vh] bg-gray-200 rounded-4xl min-w-[50vh] flex items-center justify-start flex-col gap-1 hover:translate-y-[-40px]"
      style={{ padding: "1rem" }}
    >
      <Image src={props.img} className="img w-50 h-50 rounded-full bg-white" />
      <div className="name w-full h-max text-2xl font-bold text-center">
        {props.name || "Founder Name"}
      </div>
      <div className="name w-full h-max  font-semibold text-center">
        {props.role || "Role Name"}
      </div>
      <div className="description w-full h-max text-xl font-semibold text-center">
        {props.description ||
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, autem deserunt. Voluptatum commodi dolor, consequuntur nisi itaque culpa natus. Quos non nostrum aliquam asperiores sequi."}
      </div>
      <div className="social-links flex items-center justify-center">
        <div className="social-button  w-15 h-15 rounded-full text-2xl font-bold text-white flex items-center justify-center">
          <i
            className="fa-brands fa-facebook scale-150 hover:scale-160
            cursor-pointer
            "
            style={{ color: "#208cdf" }}
          ></i>
        </div>
        <div className="social-button  w-15 h-15 rounded-full text-2xl font-bold text-white flex items-center justify-center">
          <i
            className="fa-brands fa-twitter scale-150 hover:scale-160
            cursor-pointer
            "
            style={{ color: "#208cdf" }}
          ></i>
        </div>{" "}
        <div className="social-button  w-15 h-15 rounded-full text-2xl font-bold bg-[#3094e000] text-white flex items-center justify-center">
          <i
            className="fa-brands fa-linkedin-in scale-150 hover:scale-160
            cursor-pointer
            "
            style={{ color: "#208cdf" }}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default Founder;
