import React from "react";
import Footer from "../components/Footer";
import RocketCanvas1 from "../components/RocketCanvas1";

const TermsPage = () => {
  return (
    <>
      <div className="w-screen min-h-screen flex flex-col items-center justify-center pt-20 pb-10">
        <h1 className="text-5xl font-bold mb-10">Terms & Conditions</h1>
        <div className="w-[80%] max-w-4xl p-8 bg-white rounded-2xl shadow-lg">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using Kidpreneur, you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our platform.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You must be at least 13 years old to use this platform.</li>
              <li>You are responsible for maintaining the confidentiality of your account information.</li>
              <li>You agree not to post any content that is harmful, offensive, or violates any laws.</li>
              <li>All ideas and content you share must be your original work.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Intellectual Property</h2>
            <p className="mb-6">
              All content on this platform, including text, graphics, and logos, is the property of Kidpreneur 
              or its content suppliers and is protected by intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
            <p className="mb-6">
              Kidpreneur shall not be liable for any indirect, incidental, or consequential damages 
              resulting from the use or inability to use the platform.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right to modify these terms at any time. Your continued use of the platform 
              after such changes constitutes your acceptance of the new terms.
            </p>
          </div>
        </div>
        <div className="w-full h-[50vh] mt-10">
          <RocketCanvas1 />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsPage;
