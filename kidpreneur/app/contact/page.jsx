import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Contactdetails from "../components/Contactdetails";
import ContactForm from "../components/Contact Form";

const page = () => {
  return (
    <>
      <Contactdetails />
      <ContactForm />
      <Footer />
    </>
  );
};

export default page;
