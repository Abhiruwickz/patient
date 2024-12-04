import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/navbar";
import Footer from "../../footer/footer";
import WelcomeSection from "../welcome/WelcomeSection";
import heroBg from "../../assets/1.jpg"; // Import your background image

const Hero = () => {
  const navigate = useNavigate();

  const handleAppointmentClick = () => {
    navigate("/app");
  };

  return (
    <>
      <Navbar />
      <div
        className=" bg-cover bg-center relative h-[100vh]"
        style={{
          backgroundImage: `url(${heroBg})`, // Set the background image dynamically
        }}
      >
        {/* Main Content Box */}
        <div className="absolute top-1/4 left-10 bg-black bg-opacity-50 p-8 rounded-lg max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            SIMPLIFYING <br />
            MEDICARE, <br />
            EMPOWERING YOU
          </h1>
          <p className="text-lg text-white mb-6">
            Effortlessly navigating Medicare for your peace of mind
          </p>
          <button
            onClick={handleAppointmentClick}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium mt-4"
          >
            Make An Appointment
          </button>
        </div>

        {/* Experience and Satisfaction Box */}
        <div className="absolute bottom-10 right-10 bg-black bg-opacity-50 p-4 rounded-lg flex gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-white">05+</h3>
            <p className="text-sm text-white">Years of Experience</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">100%</h3>
            <p className="text-sm text-white">Patient Satisfaction</p>
          </div>
        </div>
      </div>
      <WelcomeSection />
      <Footer />
    </>
  );
};

export default Hero;
