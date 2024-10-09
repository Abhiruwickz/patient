// /profile/components/AppointmentForm.js
import React, { useState } from 'react';
import './AppoinmentForm.css';
// import logo from '../assets/logomedi.png';
import Header from '../header1/header1';

const AppointmentForm = () => {
  const [specialization, setSpecialization] = useState('');
  const [medicalOfficer, setMedicalOfficer] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Searching with:', { specialization, medicalOfficer });
  };

  return (

    <div className="appointment-container">
        <Header />
      <div className="logo-section">
        {/* <img src={logo} alt="MediConnect Logo" className="logo" /> */}
        <h1 className="logo-title">
        </h1>
      </div>
      <div className="form-container">
        <h2 className="form-title">Make An Appointment</h2>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="specialization" className="form-label">
              <span className="icon">🩺</span> Specialization
            </label>
            <select
              id="specialization"
              className="form-input"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              {/* Add other specializations */}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="medical-officer" className="form-label">
              <span className="icon">👨‍⚕</span> Medical Officer
            </label>
            <select
              id="medical-officer"
              className="form-input"
              value={medicalOfficer}
              onChange={(e) => setMedicalOfficer(e.target.value)}
            >
              <option value="">Select Medical Officer</option>
              <option value="Dr. John Doe">Dr. John Doe</option>
              <option value="Dr. Jane Smith">Dr. Jane Smith</option>
              {/* Add other medical officers */}
            </select>
          </div>

          <button type="submit" className="form-button">
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;