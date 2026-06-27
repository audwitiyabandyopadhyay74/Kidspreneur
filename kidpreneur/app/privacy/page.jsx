import React from "react";
import Footer from "../components/Footer";
import AirplaneCanvas from "../components/AirplaneCanvas";

const PrivacyPage = () => {
  return (
    <>
    {/* / */}
      <div className="w-screen min-h-screen flex flex-col items-center justify-center pt-20 pb-10">
        <h1 className="text-5xl font-bold mb-10">Privacy Policy</h1>
        <div className="w-[80%] max-w-4xl p-8 bg-white rounded-2xl shadow-lg">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="mb-6">
              We collect information that you provide directly to us, such as when you create an account, 
              submit ideas, or communicate with us. This may include your name, email address, and any content you post.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="mb-6">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Send you technical notices and support messages</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="mb-6">
              We do not share your personal information with third parties except as described in this policy. 
              We may share information with service providers who assist us in operating our platform.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="mb-6">
              We implement appropriate security measures to protect against unauthorized access, alteration, 
              disclosure, or destruction of your personal information.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. Your Choices</h2>
            <p className="mb-6">
              You may update, correct, or delete your account information at any time by logging into your account. 
              You may also contact us to request access to your personal information.
            </p>
          </div>
        </div>
        <div className="w-full h-[50vh] mt-10">
          <AirplaneCanvas />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPage;
