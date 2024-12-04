import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CryptoJS from 'crypto-js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PSummary = () => {
  const location = useLocation();
  const { prescriptionId } = location.state || {};
  const navigate = useNavigate(); // For navigation after action completion

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const prescriptionRef = useRef();

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

  const handleComplete = async () => {
    try {
      const confirmPrescriptionRef = doc(db, 'ConfirmPrescription', prescriptionId);
      await setDoc(confirmPrescriptionRef, { Action: 'Completed' });
      setCompletionStatus('Completed');
      console.log('Prescription marked as Completed');
      navigate('/pharmacy-prescription'); // Navigate to the pharmacy-prescription page
    } catch (error) {
      console.error('Error marking prescription as complete:', error);
    }
  };

  const handlePrescriptionIssued = async () => {
    try {
      const confirmPrescriptionRef = doc(db, 'ConfirmPrescription', prescriptionId);
      await setDoc(confirmPrescriptionRef, { Action: 'Prescription Issued' });
      setCompletionStatus('Prescription Issued');
      console.log('Prescription Issued');
      navigate('/pharmacy-prescription'); // Navigate to the pharmacy-prescription page
    } catch (error) {
      console.error('Error issuing prescription:', error);
    }
  };

  const handleGeneratePDF = () => {
    html2canvas(prescriptionRef.current).then((canvas) => {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('prescription.pdf');
    });
  };

  return (
    <div className="p-6">
      <div ref={prescriptionRef} className="max-w-4xl mx-auto bg-blue-100 p-6 rounded-lg shadow-md mt-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-blue-700">Prescription</h2>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : prescription ? (
          <>
            <header className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">{prescription.doctor.doctorName}</h2>
                <p>Mob. No: {prescription.doctor.phoneNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-teal-600 font-semibold">MediConnect</span>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p>
                  <strong>ID:</strong> {prescription.nicNo} - {prescription.patient}
                </p>
                <p>
                  <strong>Address:</strong> Kandy
                </p>
                <p>
                  <strong>Temp:</strong> 36°C, <strong>BP:</strong> 120/80 mmHg
                </p>
              </div>
              <div>
                <p>
                  <strong>Patient Name:</strong> {prescription.patient}
                </p>
                <p>
                  <strong>Reference No:</strong> {prescriptionId}
                </p>
                <p>
                  <strong>Date:</strong> {prescription.prescriptionDate}
                </p>
              </div>
            </div>

            <h4 className="text-lg font-bold mb-4">Medicines Prescribed:</h4>
            <table className="table-auto w-full mb-6 text-sm">
              <thead>
                <tr className="bg-blue-200">
                  <th className="px-4 py-2">Medicine Name</th>
                  <th className="px-4 py-2">Dosage</th>
                  <th className="px-4 py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines.map((med, index) => (
                  <tr key={index} className="odd:bg-blue-50 even:bg-blue-100">
                    <td className="px-4 py-2">{med.medicineName}</td>
                    <td className="px-4 py-2">{med.instruction}</td>
                    <td className="px-4 py-2">{med.days} days</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer className="text-right text-sm">
              <p className="font-bold">{prescription.doctor.doctorName}</p>
              <p>M.B.B.S., M.D., M.S.</p>
            </footer>
          </>
        ) : (
          <p>No prescriptions available for this patient.</p>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={handleComplete}
          className="w-40 py-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700"
        >
          Mark as Completed
        </button>
        <button
          onClick={handlePrescriptionIssued}
          className="w-40 py-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700"
        >
          Issue Prescription
        </button>
        <button
          onClick={handleGeneratePDF}
          className="w-32 py-2 bg-gray-600 text-white rounded shadow-md hover:bg-gray-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default PSummary;
