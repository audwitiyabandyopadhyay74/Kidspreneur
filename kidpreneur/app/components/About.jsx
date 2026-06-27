import React from "react";

const About = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">Our Vision</h1>
      <div
        className="w-[40%] h-max rounded-tl-4xl rounded-br-4xl p-4 bg-amber-200 flex items-center justify-center flex-col font-bold text-[#fe9a00]"
        style={{ padding: "3rem" }}
      >
        Kidpreneur is a creative launchpad for young innovators. We believe that
        age is no barrier to big ideas—whether it’s a product, a service, or a
        movement, every idea deserves a stage. Here, students can:
       
          <li className="w-full h-max lg:h-6">
            {" "}
            Share their startup ideas and the problems they solve
          </li>
          <li className="w-full h-max lg:h-6">
            {" "}
            Discover what other young changemakers are building
          </li>
          <li className="w-full h-max lg:h-6">
            Take inspiration from a community that values creativity, courage,
            and curiosity.
          </li>
        Our mission is simple: empower the next generation of entrepreneurs by
        giving them a space to dream, design, and dare. You've come to the right
        place if you've ever wondered, "I wish I could make this better." Your
        journey starts here.e
      </div>
    </div>
  );
};

export default About;
