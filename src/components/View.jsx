import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using React Router for navigation
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure correct path to firebase config
import './View.css';

function View() {
  const { prescriptionId } = useParams(); // Get the prescription ID from URL params
  const [prescription, setPrescription] = useState(null); // State to store prescription data
  const [loading, setLoading] = useState(true); // State for loading status

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const prescriptionDoc = doc(db, 'Prescriptions', prescriptionId); // Access the Firestore document using prescription ID
        const prescriptionSnapshot = await getDoc(prescriptionDoc);
        
        if (prescriptionSnapshot.exists()) {
          setPrescription({ id: prescriptionSnapshot.id, ...prescriptionSnapshot.data() }); // Set the prescription data
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching prescription: ", error);
      } finally {
        setLoading(false); // Update loading status
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  if (!prescription) {
    return <div>No prescription found.</div>; // Handle case where no prescription is found
  }

  return (
    <div className='container'>
      <h2>Prescription</h2>
      <div className="prescription-card">
        <header className="headerpre">
          <div className="doctor-info">
            <h2>{prescription.doctorName}</h2> {/* Dynamically display doctor's name */}
            <p>{prescription.doctorQualifications} | Reg. No: {prescription.doctorRegNo}</p> {/* Dynamic qualifications and registration number */}
            <p>Mob. No: {prescription.doctorMobile}</p> {/* Dynamic mobile number */}
          </div>
          <div className="clinic-logo">
            <span>{prescription.clinicName}</span> {/* Dynamic clinic name */}
          </div>
        </header>

        <div className="patient-info">
          <div className="patient-details">
            <p><strong>ID: {prescription.patientId}</strong> - {prescription.patientName}</p> {/* Dynamic patient ID and name */}
            <p>Address: {prescription.patientAddress}</p> {/* Dynamic patient address */}
            <p>Temp (°C): {prescription.temperature}, BP: {prescription.bloodPressure}</p> {/* Dynamic vitals */}
          </div>
          <div className="prescription-meta">
            <p>Reference No: {prescription.referenceNo}</p> {/* Dynamic reference number */}
            <p>Date: {new Date(prescription.date).toLocaleString()}</p> {/* Dynamic prescription date */}
          </div>
        </div>

        <table className="medicine-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((med, index) => ( // Assuming medicines is an array of objects
              <tr key={index}>
                <td>{med.name}</td> {/* Dynamic medicine name */}
                <td>{med.dosage}</td> {/* Dynamic dosage */}
                <td>{med.duration}</td> {/* Dynamic duration */}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="advice">
          <strong>Advice Given:</strong>
          <p>{prescription.advice}</p> {/* Dynamic advice */}
          <p>Follow Up: {new Date(prescription.followUpDate).toLocaleDateString()}</p> {/* Dynamic follow-up date */}
        </div>

        <footer className="footer">
          <p>{prescription.doctorName}</p> {/* Dynamic doctor's name */}
          <p>{prescription.doctorQualifications}</p> {/* Dynamic qualifications */}
        </footer>
        <button className="back-button" onClick={() => window.history.back()}>Back</button>
      </div>
    </div>
  );
}

export default View;


