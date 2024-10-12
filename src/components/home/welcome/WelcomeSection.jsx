import React from 'react';
import './WelcomeSection.css';

const WelcomeSection = () => {
  return (
    <div className="welcome-section">
      <h1 className="welcome-title">
        Your Health, Our Priority 
        <span className="welcome-mediconnect"></span>
      </h1>
      <h2 className="welcome-subtitle">
        Compassionate, Innovative, and Dedicated Care
        <span className='welcome-subtitle-span'></span>
      </h2>
      
      <p className="welcome-description">
        Transform your healthcare journey with MediConnect – an all-in-one system connecting you to seamless care, from appointments to prescriptions. Experience convenience, compassion, and complete control over your health.
      </p>
    </div>
  );
};

export default WelcomeSection;
