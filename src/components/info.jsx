import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'
import './info.css';

function PatientInfo() {
  const location = useLocation();
  const { patientId } = location.state || {};
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true); // Keep to show loading state
  const [error, setError] = useState(null); // Keep to handle errors

  useEffect(() => {
    if (!patientId) {
      setError('Patient ID not available.');
      setLoading(false);
      return;
    }

    const fetchPatientInfo = async () => {
      try {
        const docRef = doc(db, 'Appointments', patientId); // Assuming data is in 'Appointments'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatientData(docSnap.data());
        } else {
          setError('No matching patient found.');
        }
      } catch (error) {
        console.error('Error fetching patient info:', error);
        setError('Error fetching patient info: ' + error.message);
      } finally {
        setLoading(false); // Stop loading after fetching data or error
      }
    };

    fetchPatientInfo();
  }, [patientId]);

  // Conditionally render based on loading, error, and data
  if (loading) {
    return <div className="patient-info">Loading patient information...</div>;
  }

  if (error) {
    return <div className="patient-info error">{error}</div>;
  }

  if (!patientData) {
    return <div className="patient-info">No data available for this patient.</div>;
  }

  return (
    <div className="patient-info">
      <main className="patient-info-main">
        <div className="patient-info-content">
          <h2 className="patient-info-greeting">Good Morning, Dr Sheril</h2>
          <div className="patient-info-cards">
            <div className="patient-info-card">
              <img
                src="./assets/10522988-2.svg"
                alt="Patient Profile"
                className="patient-profile-pic"
              />
              <h3>{patientData.patientName}</h3>
            </div>
            <div className="patient-info-details">
              <h3 className="patient-info-title">Patient Info</h3>
              <div className="patient-details">
                <div className="patient-detail">
                  <span>References no :</span>
                  <span>{patientData.referenceNumber || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Name :</span>
                  <span>{patientData.patientName || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Address :</span>
                  <span>{patientData.address || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Email :</span>
                  <span>{patientData.email || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Phone :</span>
                  <span>{patientData.contactNo || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>DOB :</span>
                  <span>{patientData.dob || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Blood Group :</span>
                  <span>{patientData.bloodGroup || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Occupation :</span>
                  <span>{patientData.occupation || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Allergies or other :</span>
                  <span>{patientData.allergies || 'N/A'}</span>
                </div>
                <div className="patient-detail">
                  <span>Gender :</span>
                  <span>{patientData.gender || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="action-buttons">
            <button className="back-btn" onClick={() => window.history.back()}>
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientInfo;
