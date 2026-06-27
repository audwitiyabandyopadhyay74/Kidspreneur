import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EarthCanvas from "../components/EarthCanvas";

const DisclaimerPage = () => {
  return (
    <>
      <div className="w-screen min-h-screen flex flex-col items-center justify-center pt-20 pb-10">
        <h1 className="text-5xl font-bold mb-10">Disclaimer</h1>
        <div className="w-[80%] max-w-4xl p-8 bg-white rounded-2xl shadow-lg">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">1. No Professional Advice</h2>
            <p className="mb-6">
              The content provided on Kidpreneur is for informational and educational purposes only and does not 
              constitute professional advice. We encourage users to seek appropriate professional advice before 
              making any decisions based on the information provided on our platform.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. No Endorsement</h2>
            <p className="mb-6">
              Kidpreneur does not endorse any specific ideas, products, services, or companies that may be mentioned 
              on the platform. Any views or opinions expressed are those of the individual users and do not 
              necessarily reflect our official policy or position.
            </p>

            <h2 className="text-2xl font-bold mb-4">3. Accuracy of Information</h2>
            <p className="mb-6">
              While we strive to provide accurate and up-to-date information, we make no representations or 
              warranties of any kind about the completeness, accuracy, reliability, suitability, or availability 
              of the information on our platform.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
            <p className="mb-6">
              In no event shall Kidpreneur be liable for any loss or damage including without limitation, 
              indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of 
              data or profits arising out of, or in connection with, the use of this website.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. External Links</h2>
            <p className="mb-6">
              Our website may contain links to external websites that are not provided or maintained by us. 
              We do not guarantee the accuracy, relevance, timeliness, or completeness of any information 
              on these external websites.
            </p>
          </div>
        </div>
        <div className="w-full h-[50vh] mt-10">
          <EarthCanvas />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DisclaimerPage;
