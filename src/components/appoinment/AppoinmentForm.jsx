// /profile/components/AppointmentForm.js
import React, { useState, useEffect } from 'react';
import './AppoinmentForm.css';
import Header from '../header1/header1';
import { db } from '../../firebaseConfig'; // Adjust the import based on your Firebase config file
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AppointmentForm = () => {
  const [specialization, setSpecialization] = useState('');
  const [medicalOfficer, setMedicalOfficer] = useState('');
  const [specializationsList, setSpecializationsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch specializations on component mount
  useEffect(() => {
    const fetchSpecializations = async () => {
      const specializationsCollection = collection(db, 'Doctors');
      const snapshot = await getDocs(specializationsCollection);
      const specializations = snapshot.docs.map(doc => doc.data().specialization);
      setSpecializationsList([...new Set(specializations)]); // Remove duplicates
    };

    fetchSpecializations();
  }, []);

  // Fetch doctors when specialization is selected
  useEffect(() => {
    const fetchDoctors = async () => {
      if (specialization) {
        const doctorsCollection = collection(db, 'Doctors');
        const snapshot = await getDocs(doctorsCollection);
        const doctors = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(doctor => doctor.specialization === specialization); // Filter by specialization

        setDoctorsList(doctors);
      } else {
        setDoctorsList([]); // Reset doctors list if no specialization is selected
      }
    };

    fetchDoctors();
  }, [specialization]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (medicalOfficer) {
      const selectedDoctor = doctorsList.find(doctor => doctor.doctorName === medicalOfficer);
      if (selectedDoctor) {
        // Navigate to the schedule page of the selected doctor with state containing doctorId
        navigate('/schedule', { state: { doctorId: selectedDoctor.id } }); // Pass doctor ID in state
      }
    }
};


  return (
    <div className="appointment-container">
      <Header />
      <div className="logo-section">
        <h1 className="logo-title"></h1>
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
              {specializationsList.map((spec, index) => (
                <option key={index} value={spec}>
                  {spec}
                </option>
              ))}
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
              {doctorsList.map((doctor) => (
                <option key={doctor.id} value={doctor.doctorName}>
                  {doctor.doctorName}
                </option>
              ))}
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
