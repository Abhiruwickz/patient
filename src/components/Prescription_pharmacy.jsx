import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'; // Add getDoc for fetching a single document
import { db } from '../firebaseConfig'; // Import Firebase config
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import CryptoJS from 'crypto-js'; // Import CryptoJS
import './Prescription_pharmacy.css'; // Import CSS

function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const encryptionKey = process.env.REACT_APP_SECRET_KEY;
  const navigate = useNavigate(); // Initialize navigate

  const decryptPrescriptionData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        console.error("Decryption failed: No decrypted text found");
        return 'Unknown'; // Return 'Unknown' for failed decryption
      }

      return decryptedText;
    } catch (error) {
      console.error("Error decrypting data:", error);
      return 'Unknown'; // Return 'Unknown' on error
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'prescriptions'));
      const prescriptionsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        const decryptedPrescription = {
          id: doc.id,
          doctor: {
            doctorName: decryptPrescriptionData(data.doctor.doctorName),
            biography: decryptPrescriptionData(data.doctor.biography),
          },
          patient: decryptPrescriptionData(data.patient),
          prescriptionDate: decryptPrescriptionData(data.prescriptionDate),
          diagnosis: decryptPrescriptionData(data.diagnosis),
          note: decryptPrescriptionData(data.note),
          appointmentNo: decryptPrescriptionData(data.appointmentNo),
          nicNo: decryptPrescriptionData(data.nicNo), // Decrypt nicNo
          medicines: data.medicines.map((med) => ({
            medicineName: decryptPrescriptionData(med.medicineName),
            instruction: decryptPrescriptionData(med.instruction),
            days: decryptPrescriptionData(med.days),
          })),
          createdDate: data.createdDate,
          // Initialize status as 'Pending', will be updated after fetching from ConfirmPrescription
          status: 'Pending',
        };

        prescriptionsData.push(decryptedPrescription);
      });

      // Sort prescriptions by id in descending order
      prescriptionsData.sort((a, b) => b.id.localeCompare(a.id));

      // After fetching prescriptions, fetch their status from ConfirmPrescription
      await fetchStatuses(prescriptionsData);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError('Error fetching prescriptions: ' + error.message);
      setLoading(false);
    }
  };

  const fetchStatuses = async (prescriptionsData) => {
    try {
      const statusPromises = prescriptionsData.map(async (prescription) => {
        const statusRef = doc(db, 'ConfirmPrescription', prescription.id);
        const statusDoc = await getDoc(statusRef);
        
        if (statusDoc.exists()) {
          const statusData = statusDoc.data();
          // Update the prescription status based on the ConfirmPrescription Action
          return { ...prescription, status: statusData.Action };
        } else {
          // If the status document doesn't exist, keep it as 'Pending'
          return prescription; // Return the prescription as is with status 'Pending'
        }
      });

      const updatedPrescriptions = await Promise.all(statusPromises);
      setPrescriptions(updatedPrescriptions);
      setFilteredPrescriptions(updatedPrescriptions); // Set filtered prescriptions to show all initially
      setLoading(false);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setError('Error fetching statuses: ' + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleSearch = () => {
    const searchText = searchQuery.toLowerCase();

    const filtered = prescriptions.filter((prescription) => {
      return (
        (prescription.patient?.toLowerCase() || '').includes(searchText) ||
        (prescription.appointmentNo?.toLowerCase() || '').includes(searchText) ||
        (prescription.nicNo?.toLowerCase() || '').includes(searchText) ||
        (prescription.id.toLowerCase() || '').includes(searchText) // Include prescription ID in the search
      );
    });

    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, prescriptions]);

  const handleViewPrescription = (prescriptionId) => {
    navigate(`/psummary`, { state: { prescriptionId } }); // Pass prescription ID in state
  };

  // Function to update the status in ConfirmPrescription collection
  const updateStatus = async (id, action) => {
    try {
      const prescriptionRef = doc(db, 'ConfirmPrescription', id); // Reference to the document in ConfirmPrescription collection

      // Update the prescription with the new status
      await setDoc(prescriptionRef, { Action: action });

      // Update the local state to reflect the change in the UI
      setFilteredPrescriptions((prev) =>
        prev.map((prescription) =>
          prescription.id === id
            ? { ...prescription, status: action } // Update the status field
            : prescription
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="prescriptions-list">
      <h2>Prescriptions List</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by patient name, appointment number, NIC, or Prescription ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Prescription ID</th>
            <th>Appointment No</th>
            <th>Patient Name</th>
            <th>NIC</th>
            <th>Prescription</th>
            <th>Status</th> {/* Status column */}
          </tr>
        </thead>
        <tbody>
          {filteredPrescriptions.map((prescription) => (
            <tr key={prescription.id}>
              <td>{prescription.id}</td> {/* Display actual prescription ID */}
              <td>{prescription.appointmentNo}</td>
              <td>{prescription.patient}</td>
              <td>{prescription.nicNo}</td>
              <td>
                <button onClick={() => handleViewPrescription(prescription.id)}>
                  View Prescription
                </button>
              </td>
              <td>
                {/* Show status based on the current state */}
                {prescription.status === 'Completed' && <span>Completed</span>}
                {prescription.status === 'Prescription Issued' && <span>Prescription Issued</span>}
                {prescription.status === 'Pending' && <span>Pending</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrescriptionsList;
