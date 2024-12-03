import React, { useState, useEffect } from 'react';
import './AppoinmentForm.css';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AppointmentForm = () => {
  const [specialization, setSpecialization] = useState('');
  const [medicalOfficer, setMedicalOfficer] = useState('');
  const [specializationsList, setSpecializationsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecializations = async () => {
      const specializationsCollection = collection(db, 'Doctors');
      const snapshot = await getDocs(specializationsCollection);
      const specializations = snapshot.docs.map(doc => doc.data().specialization);
      setSpecializationsList([...new Set(specializations)]);
    };
    fetchSpecializations();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (specialization) {
        const doctorsCollection = collection(db, 'Doctors');
        const snapshot = await getDocs(doctorsCollection);
        const doctors = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(doctor => doctor.specialization === specialization);
        setDoctorsList(doctors);
      } else {
        setDoctorsList([]);
      }
    };
    fetchDoctors();
  }, [specialization]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (medicalOfficer) {
      const selectedDoctor = doctorsList.find(doctor => doctor.doctorName === medicalOfficer);
      if (selectedDoctor) {
        navigate('/schedule', { state: { doctorId: selectedDoctor.id } });
      }
    }
  };

  return (
    <div className="appointment-container">
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
              <span className="icon">👨‍⚕️</span> Medical Officer
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
