import React from "react";

const Contactdetails = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center gap-5">
      <div className="details w-[35%] h-[50%] bg-gray-200 rounded-4xl flex flex-col items-center justify-evenly">
        <h1 className="text-5xl capitalize font-bold font-[cursive] a">
          Details
        </h1>
        <ul className="flex flex-col items-start justify-start w-[80%] gap-8">
          <li className=" flex items-center justify-center font-semibold gap-4">
            <i className="fa-solid fa-envelope text-3xl fa-bounce"></i>
            <a
              href="mailto:audwitiyabandyopadhyay74@outlook.com"
              className="text-[20px]"
            >
              audwitiyabandyopadhyay74@outlook.com
            </a>
          </li>
          <li className=" flex items-center justify-center font-semibold gap-4">
            <i className="fa-solid fa-phone text-3xl fa-beat"></i>
            <a href="tel:917430836770" className="text-[20px]">
              +91 7430836770
            </a>
          </li>
        </ul>
      </div>
      <hr className="w-1 h-[50%] bg-black rounded-full" />
      <div className="details w-[35%] h-[50%] bg-gray-200 rounded-4xl flex flex-col items-center justify-evenly">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d38357284.87153929!2d65.66114547039076!3d31.33437354771635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1756969758374!5m2!1sen!2sin"
          className="w-full h-full rounded-4xl"
          style={{ border: 0 }}
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default Contactdetails;
