import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CryptoJS from 'crypto-js';
import './PatientMedicalHistory.css';

const MedicalHistory = () => {
  const location = useLocation();
  const { nicNo } = location.state || {}; // Retrieve nicNo from state

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(location.state); // Log the location state to debug

    if (!nicNo) {
      setError('NIC number not available.');
      setLoading(false);
      return;
    }

    const fetchPrescriptions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'prescriptions'));
        const prescriptionsData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Decrypt the nicNo and compare with the passed nicNo
          const decryptedNic = CryptoJS.AES.decrypt(data.nicNo, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8);
          if (decryptedNic === nicNo) {
            // Decrypt other fields
            const decryptedPrescription = {
              id: doc.id,
              doctor: {
                doctorName: CryptoJS.AES.decrypt(data.doctor.doctorName, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
                biography: CryptoJS.AES.decrypt(data.doctor.biography, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
                phoneNumber: CryptoJS.AES.decrypt(data.doctor.phoneNumber, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8)
              },
              patient: CryptoJS.AES.decrypt(data.patient, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              prescriptionDate: CryptoJS.AES.decrypt(data.prescriptionDate, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              diagnosis: CryptoJS.AES.decrypt(data.diagnosis, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              note: CryptoJS.AES.decrypt(data.note, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              appointmentNo: CryptoJS.AES.decrypt(data.appointmentNo, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              nicNo: decryptedNic,
              medicines: data.medicines.map(med => ({
                medicineName: CryptoJS.AES.decrypt(med.medicineName, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
                instruction: CryptoJS.AES.decrypt(med.instruction, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
                days: CryptoJS.AES.decrypt(med.days, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              })),
              createdDate: data.createdDate
            };

            prescriptionsData.push(decryptedPrescription);
          }
        });

        setPrescriptions(prescriptionsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setError('Error fetching prescriptions: ' + error.message);
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [nicNo, location.state]);

  return (
    <div className="prescriptions-container">
      <h1>Patient's Medical History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : prescriptions.length > 0 ? (
        <div className="grid-container">
          {prescriptions.map((prescription, index) => (
            <div key={index} className="grid-item">
              <h3>Prescription Date: {prescription.prescriptionDate}</h3>
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
          ))}
        </div>
      ) : (
        <p>No prescriptions available for this patient.</p>
      )}
      <button className="back-button" onClick={() => window.history.back()}>Back</button>
    </div>
  );
};

export default MedicalHistory;
