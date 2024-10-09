import React from 'react';
import './WelcomeSection.css';

const WelcomeSection = () => {
  return (
    <div className="welcome-section">
      <h1>
        Welcome To <span className="mediconnect">MediConnect</span>
      </h1>
      <h2>Dedicated To You</h2>
      <h3>Excellence, Innovation, and Compassion</h3>
      <p className="description">
        Revolutionize your healthcare experience with our comprehensive Medicare
        management system, seamlessly integrated with Mediconnect, your trusted
        in-house pharmacy. With streamlined access to your coverage, claims, and
        prescriptions, everything you need is at your fingertips.
      </p>
      <p className="description">
        Mediconnect ensures that your medications are delivered with accuracy and
        care, perfectly synced with your Medicare plan. It’s more than just
        management. It’s a holistic approach to your health, where convenience meets
        compassion.
      </p>
    </div>
  );
};

export default WelcomeSection;
