import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CryptoJS from 'crypto-js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './psummary.css';

const PSummary = () => {
  const location = useLocation();
  const { prescriptionId } = location.state || {};

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null); // State to track the completion status
  const prescriptionRef = useRef(); // Ref to capture the prescription summary

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
              phoneNumber: CryptoJS.AES.decrypt(data.doctor.phoneNumber, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            },
            patient: CryptoJS.AES.decrypt(data.patient, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            prescriptionDate: new Date(data.createdDate).toLocaleDateString(),
            diagnosis: CryptoJS.AES.decrypt(data.diagnosis, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            note: CryptoJS.AES.decrypt(data.note, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            appointmentNo: CryptoJS.AES.decrypt(data.appointmentNo, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            nicNo: prescriptionId,
            medicines: data.medicines.map((med) => ({
              medicineName: CryptoJS.AES.decrypt(med.medicineName, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              instruction: CryptoJS.AES.decrypt(med.instruction, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
              days: CryptoJS.AES.decrypt(med.days, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            })),
            createdDate: data.createdDate,
          };

          setPrescription(decryptedPrescription);
        } else {
          setError('No such prescription found.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prescription:', error);
        setError('Error fetching prescription: ' + error.message);
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  // Function to handle Complete button click
  const handleComplete = async () => {
    try {
      const confirmPrescriptionRef = doc(db, 'ConfirmPrescription', prescriptionId);
      await setDoc(confirmPrescriptionRef, { Action: 'Completed' });

      setCompletionStatus('Completed'); // Update the status state to "Completed"
      console.log('Prescription marked as complete');
    } catch (error) {
      console.error('Error marking prescription as complete:', error);
    }
  };

  // Function to handle Prescription Issued button click
  const handlePrescriptionIssued = async () => {
    try {
      const confirmPrescriptionRef = doc(db, 'ConfirmPrescription', prescriptionId);
      await setDoc(confirmPrescriptionRef, { Action: 'Prescription Issued' });

      setCompletionStatus('Prescription Issued'); // Update the status state to "Prescription Issued"
      console.log('Prescription has been issued');
    } catch (error) {
      console.error('Error issuing prescription:', error);
    }
  };

  // Function to handle PDF generation
  const handleGeneratePDF = () => {
    html2canvas(prescriptionRef.current).then(canvas => {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180; // Width of PDF
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      position += heightLeft;

      pdf.save('prescription.pdf'); // Save the generated PDF
    });
  };

  return (
    <div>
      <div className="prescription-container" ref={prescriptionRef}> {/* Add ref to the container */}
        <div className="pretitle">
          <h2>Prescription</h2>
        </div>
        <div className="prescription-card">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : prescription ? (
            <>
              <header className="headerpre">
                <div className="doctor-info">
                  <h2>{prescription.doctor.doctorName}</h2>
                  
                  <p>Mob. No: {prescription.doctor.phoneNumber}</p>
                </div>
                <div className="clinic-logo">
                  <span>MediConnect</span>
                </div>
              </header>

              <div className="patient-info">
                <div className="patient-details">
                  <p>
                    <strong>ID: {prescription.nicNo}</strong> - {prescription.patient}
                  </p>
                  <p>Address: Kandy</p>
                  <p>Temp (deg): 36, BP: 120/80 mmHg</p>
                </div>
                <div className="prescription-meta">
                  <p>Patient Name: {prescription.patient}</p>
                  <p>Reference No: {prescriptionId}</p>
                  <p>Date: {prescription.prescriptionDate}</p>
                </div>
              </div>

              <h4>Medicines Prescribed:</h4>
              <table className="medicine-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicines.map((med, index) => (
                    <tr key={index}>
                      <td>{med.medicineName}</td>
                      <td>{med.instruction}</td>
                      <td>{med.days} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              
                
              

              <footer className="footer">
                <p>{prescription.doctor.doctorName}</p>
                <p>M.B.B.S., M.D., M.S.</p>
              </footer>
            </>
          ) : (
            <p>No prescriptions available for this patient.</p>
          )}
        </div>
      </div>

      {/* Conditionally render buttons and status */}
      <div className="action-buttons">
        {completionStatus ? (
          <p>{completionStatus}</p> // Display the status once one of the buttons is clicked
        ) : (
          <>
            <div className="button-wrapper1">
              <button onClick={handleComplete}>Complete</button>
            </div>
            <div className="button-wrapper2">
              <button onClick={handlePrescriptionIssued}>Prescription Issued</button>
            </div>
          </>
        )}
        <div className="button-wrapper3">
          <button onClick={handleGeneratePDF}>Download Prescription</button>
        </div>
      </div>
    </div>
  );
};

export default PSummary;
