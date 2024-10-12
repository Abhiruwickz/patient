import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './hero.css';
import Navbar from '../navbar/navbar';  
import Footer from '../../footer/footer'; 
import WelcomeSection from '../welcome/WelcomeSection';

const Hero = () => {
  const navigate = useNavigate(); // Initialize navigate for navigation

  const handleAppointmentClick = () => {
    navigate('/app'); // Navigate to the /app page
  };

  return (
    <>
      <Navbar /> 

      <div className="hero-section">
        <div className="hero-content">
          <h1>SIMPLIFYING<br />MEDICARE,<br />EMPOWERING YOU</h1>
          <p>Effortlessly managing Medicare for your peace of mind</p>
          <div className="hero-stats">
            <div className="years">
              <h3>05+</h3>
              <p>Years of Experience</p>
            </div>
            <div className="satisfaction">
              <h3>100%</h3>
              <p>Patient Satisfaction</p>
              <button className="appointment-btn" onClick={handleAppointmentClick}>
                Make An Appointment
              </button>
            </div>
          </div>
        </div>
        {/* <img src={doctor} alt="Doctor" className="hero-image" /> */}
      </div>

      <WelcomeSection />

      <Footer /> 
    </>
  );
};

export default Hero;