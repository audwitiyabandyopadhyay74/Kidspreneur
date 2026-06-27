import React from "react";
import Link from "next/link";

const date = new Date();
const year = date.getFullYear();

const Footer = () => {
  return (
    <footer className="w-screen h-[60vh] flex items-start justify-center flex-col">
      <div className="w-screen h-[40vh] flex items-start justify-center">
        <div className="quick-links h-full w-[25%]" style={{ padding: "1rem" }}>
          <span className="text-5xl font-bold">Quick Links</span>
          <ul
            className="w-full h-max flex flex-col gap-6 items-start justify-center"
            style={{ padding: "1rem" }}
          >
            <li className="w-max">
              <Link href="/about" className="a hover:text-amber-500 transition-colors">
                About us
              </Link>
            </li>
            <li className="w-max">
              <Link href="/explore" className="a hover:text-amber-500 transition-colors">
                Explore
              </Link>
            </li>
            <li className="w-max">
              <Link href="/leaderboard" className="a hover:text-amber-500 transition-colors">
                Leaderboard
              </Link>
            </li>
          </ul>
        </div>
        <div
          className="support-links h-full w-[25%]"
          style={{ padding: "1rem" }}
        >
          <span className="text-5xl font-bold">Support Links</span>
          <ul
            className="w-full h-max flex flex-col gap-6 items-start justify-center"
            style={{ padding: "1rem" }}
          >
            <li className="w-max">
              <Link href="/contact" className="a hover:text-amber-500 transition-colors">
                Contact us
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-[18vh] flex w-screen gap-4 items-center justify-center bg-gray-200">
        <ul
          className="w-full h-max flex gap-6 items-center justify-center flex-wrap"
          style={{ padding: "1rem" }}
        >
          <li className="w-max">
            <Link href="/terms" className="a hover:text-amber-500 transition-colors">
              Terms & Conditions
            </Link>
          </li>
          <li className="w-max">
            <Link href="/privacy" className="a hover:text-amber-500 transition-colors">
              Privacy & Policy
            </Link>
          </li>
          <li className="w-max">
            <Link href="/disclaimer" className="a hover:text-amber-500 transition-colors">
              Disclaimer
            </Link>
          </li>
          <li className="w-max">
            <Link href="/payment" className="a hover:text-amber-500 transition-colors">
              Payment
            </Link>
          </li>
        </ul>
      </div>
      <div className="h-[5vh] flex w-screen gap-4 items-center justify-center bg-gray-200">
        <ul
          className="w-full h-max flex  gap-6 items-Start justify-center nav-links"
          style={{ padding: "1rem" }}
        >
          <li className="w-max">©️Copyright {year}</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
