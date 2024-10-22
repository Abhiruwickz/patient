import React, { useEffect, useState } from 'react';
import './Summary.css';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore'; 
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import CryptoJS from 'crypto-js';
import { getStorage, ref, uploadString } from 'firebase/storage';

const Summary = () => {
  const location = useLocation();
  const summaryData = location.state || {};
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const doctorId = location.state?.doctorId || localStorage.getItem('doctorId');

  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not available.');
      setLoading(false);
      return;
    }

    const fetchDoctorData = async () => {
      try {
        const docRef = doc(db, 'Doctors', doctorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDoctorDetails(docSnap.data());
          localStorage.setItem('doctorId', doctorId);
        } else {
          setError('No matching doctor found.');
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error.message);
        setError('Error fetching doctor data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  const handleBack = () => {
    // Logic for navigating back (implement according to your routing logic)
    console.log('Back button clicked');
  };

  const handleSend = async () => {
    if (!process.env.REACT_APP_SECRET_KEY) {
      console.error("REACT_APP_SECRET_KEY is not defined");
      return;
    }

    // Capture the summary container as an image
    const summaryContainer = document.querySelector('.summary-container');
    const canvas = await html2canvas(summaryContainer);
    const imgData = canvas.toDataURL('image/png');

    // Check if imgData is in the correct format
    if (!imgData.startsWith('data:image/png;base64,' )) {
      console.error("Image data URL is not properly formatted");
      alert('Failed to capture image. Please try again.');
      return;
    }

    // Encrypt the image data
    const encryptedImgData = CryptoJS.AES.encrypt(imgData, process.env.REACT_APP_SECRET_KEY).toString();

    // Encrypt the summary data
    const summaryToSend = {
      doctor: {
        doctorName: CryptoJS.AES.encrypt(doctorDetails.doctorName, process.env.REACT_APP_SECRET_KEY).toString(),
        biography: CryptoJS.AES.encrypt(doctorDetails.biography, process.env.REACT_APP_SECRET_KEY).toString(),
        phoneNumber: CryptoJS.AES.encrypt(doctorDetails.phoneNumber, process.env.REACT_APP_SECRET_KEY).toString(),
      },
      patient: CryptoJS.AES.encrypt(summaryData.patient, process.env.REACT_APP_SECRET_KEY).toString(),
      prescriptionDate: CryptoJS.AES.encrypt(summaryData.prescriptionDate, process.env.REACT_APP_SECRET_KEY).toString(),
      diagnosis: CryptoJS.AES.encrypt(summaryData.diagnosis, process.env.REACT_APP_SECRET_KEY).toString(),
      note: CryptoJS.AES.encrypt(summaryData.note, process.env.REACT_APP_SECRET_KEY).toString(),
      appointmentNo: CryptoJS.AES.encrypt(summaryData.appointmentNo, process.env.REACT_APP_SECRET_KEY).toString(),
      nicNo: CryptoJS.AES.encrypt(summaryData.nicNo, process.env.REACT_APP_SECRET_KEY).toString(),
      medicines: summaryData.medicines.map(med => ({
        medicineName: CryptoJS.AES.encrypt(med.medicineName, process.env.REACT_APP_SECRET_KEY).toString(),
        instruction: CryptoJS.AES.encrypt(med.instruction, process.env.REACT_APP_SECRET_KEY).toString(),
        days: CryptoJS.AES.encrypt(med.days.toString(), process.env.REACT_APP_SECRET_KEY).toString(),
      })),
      encryptedImage: encryptedImgData, // Add encrypted image data
      createdDate: new Date().toISOString() // Add created date
    };

    console.log("Summary to send:", summaryToSend); // Log the summary

    try {
      // Generate a unique prescription ID
      const prescriptionId = `PID${(await getPrescriptionCount()) + 1}`; // Auto-incrementing ID
      console.log("Generated Prescription ID:", prescriptionId); // Log the generated ID

      // Upload encrypted image to Firebase Storage
      const storage = getStorage();
      const imageRef = ref(storage, `prescriptions/${prescriptionId}.png`);
      
      // Ensure we upload the encrypted image directly as a base64 string
      await uploadString(imageRef, encryptedImgData, 'base64'); // Correctly specify base64 format
      console.log("Image uploaded to Firebase Storage");

      // Set the summary data to Firestore with the custom document ID
      await setDoc(doc(db, "prescriptions", prescriptionId), summaryToSend);
      console.log("Document written with ID: ", prescriptionId);

      // Optionally, show feedback to the user here (e.g., alert, toast)
      alert('Prescription sent successfully! Reference No: ' + prescriptionId);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Error sending prescription: ' + e.message);
    }
  };

  // Function to count existing prescriptions
  const getPrescriptionCount = async () => {
    try {
      const prescriptionCollection = collection(db, "prescriptions");
      const prescriptionDocs = await getDocs(prescriptionCollection);
      let maxId = 0;

      prescriptionDocs.forEach(doc => {
        const id = parseInt(doc.id.replace('PID', ''));
        if (id > maxId) {
          maxId = id;
        }
      });
      console.log("Maximum Prescription ID:", maxId); // Log the maximum ID found
      return maxId; // Return the maximum ID found
    } catch (error) {
      console.error("Error fetching prescription count: ", error.message);
      return 0; // Fallback to zero if there's an error
    }
  };

  return (
    <div className="summary-container">
      <div className="patient-details">
        <div className="left-section">
          {loading ? (
            <p>Loading doctor details...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              <h3>{doctorDetails?.doctorName || 'Doctor Name'}</h3>
              <p>{doctorDetails?.biography || 'Biography'}</p>
              <p>Mob. No: {doctorDetails?.phoneNumber || 'Phone Number'}</p>
            </>
          )}
        </div>
        <div className="right-section">
          <p><strong>Patient Name:</strong> {summaryData.patient}</p>
          <p><strong>Appointment No:</strong> {summaryData.appointmentNo}</p>
          <p><strong>NIC No:</strong> {summaryData.nicNo}</p>
          <p><strong>Prescription Date:</strong> {summaryData.prescriptionDate}</p>
          <p><strong>Diagnosis:</strong> {summaryData.diagnosis}</p>
          <p><strong>Note:</strong> {summaryData.note}</p>
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
          {summaryData.medicines && summaryData.medicines.map((med, index) => (
            <tr key={index}>
              <td>{med.medicineName}</td>
              <td>{med.instruction}</td>
              <td>{med.days}</td>
            </tr>
          ))} 
        </tbody>
      </table>

      <div className="advice-section">
        <p><strong>Advice Given:</strong> {summaryData.advice || "Avoid Oily and Spicy Food"}</p>
        <p><strong>Follow Up:</strong> {summaryData.followUp || "8-Nov-2024"}</p>
      </div>

      <div className="button-container">
        <button className="back-button" onClick={handleBack}>Back</button>
        <button className="send-button" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Summary;
