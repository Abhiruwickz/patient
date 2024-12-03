import React from 'react';
import './View.css';
import { useLocation } from 'react-router-dom';

const View = () => {
  const { state } = useLocation(); // Retrieve the state passed from the PrescriptionsList component
  const prescription = state?.prescription || {}; // Get prescription data or fallback to empty object

  return (
    <div>
      <div className='pretitle'>
        <div>Prescription</div>
      </div>

      <div className="prescription-card">
        <header className="headerpre">
          <div className="doctor-info">
            <h2>{prescription.doctor?.doctorName}</h2>
            <p>{prescription.doctor?.biography} | Reg. No: {prescription.doctor?.regNo}</p>
            <p>Mob. No: {prescription.doctor?.phoneNumber}</p>
          </div>
          <div className="clinic-logo">
            <span>MediConnect</span>
          </div>
        </header>

        <div className="patient-info">
          <div className="patient-details">
            <p><strong>ID: {prescription.nicNo}</strong> - {prescription.patient} (M)</p>
            <p>Address: {prescription.address || 'N/A'}</p>
            <p>Temp (deg): {prescription.temp || 'N/A'}, BP: {prescription.bp || 'N/A'}</p>
          </div>
          <div className="prescription-meta">
            <p>Patient Name: {prescription.patient}</p>
            <p><strong>Reference No:</strong> {prescription.referenceNo || 'N/A'}</p> {/* Reference No */}
            <p>Date: {prescription.prescriptionDate || 'N/A'}</p>
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
            {prescription.medicines?.map((med, index) => (
              <tr key={index}>
                <td>{index + 1}) {med.medicineName}</td>
                <td>{med.instruction}</td>
                <td>{med.days}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="advice">
          <strong>Advice Given:</strong>
          <p>* {prescription.note || 'No specific advice provided.'}</p>
          <p>Follow Up: {prescription.followUpDate || 'N/A'}</p>
        </div>

        <footer className="footer">
          <p>{prescription.doctor?.doctorName}</p>
          <p>M.B.B.S., M.D., M.S.</p>
        </footer>
      </div>
    </div>
  );
};

export default View;
