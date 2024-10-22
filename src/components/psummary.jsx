import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc for fetching specific document
import { db } from '../firebaseConfig';
import CryptoJS from 'crypto-js';
import './psummary.css';

const PSummary = () => {
  const location = useLocation();
  const { prescriptionId } = location.state || {}; // Retrieve prescriptionId from state

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!prescriptionId) {
      setError('Prescription ID not available.');
      setLoading(false);
      return;
    }

    const fetchPrescription = async () => {
      try {
        const docRef = doc(db, 'prescriptions', prescriptionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const decryptedPrescription = {
            id: docSnap.id,
            doctor: {
              doctorName: CryptoJS.AES.decrypt(data.doctor.doctorName, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              biography: CryptoJS.AES.decrypt(data.doctor.biography, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              phoneNumber: CryptoJS.AES.decrypt(data.doctor.phoneNumber, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8)
            },
            patient: CryptoJS.AES.decrypt(data.patient, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            prescriptionDate: new Date(data.createdDate).toLocaleDateString(), // Format date to display only date
            diagnosis: CryptoJS.AES.decrypt(data.diagnosis, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            note: CryptoJS.AES.decrypt(data.note, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            appointmentNo: CryptoJS.AES.decrypt(data.appointmentNo, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            nicNo: prescriptionId, // Assuming you are using prescriptionId as NIC number
            medicines: data.medicines.map(med => ({
              medicineName: CryptoJS.AES.decrypt(med.medicineName, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              instruction: CryptoJS.AES.decrypt(med.instruction, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              days: CryptoJS.AES.decrypt(med.days, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            })),
            createdDate: data.createdDate
          };

          setPrescription(decryptedPrescription);
        } else {
          setError('No such prescription found.');
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prescription:", error);
        setError('Error fetching prescription: ' + error.message);
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  return (
    <div className="prescriptions-container">
      <h1>Patient's Medical History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : prescription ? (
        <div className="grid-container">
          <h3>Prescription Date: {prescription.prescriptionDate}</h3> {/* Displaying formatted created date */}
          <p><strong>Doctor Name:</strong> {prescription.doctor.doctorName}</p>
          <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
          <p><strong>Medicines:</strong></p>
          <ul>
            {prescription.medicines.map((med, medIndex) => (
              <li key={medIndex}>
                {med.medicineName} - {med.instruction} for {med.days} days
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No prescriptions available for this patient.</p>
      )}
      <button className="back-button" onClick={() => window.history.back()}>Back</button>
    </div>
  );
};

export default PSummary;
