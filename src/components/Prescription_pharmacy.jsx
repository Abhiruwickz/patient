import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure correct path to firebase config
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import CryptoJS from 'crypto-js'; // Import CryptoJS
import './Prescription_pharmacy.css'; // Make sure to import CSS
 
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
            phoneNumber: decryptPrescriptionData(data.doctor.phoneNumber),
          },
          patient: decryptPrescriptionData(data.patient),
          prescriptionDate: decryptPrescriptionData(data.prescriptionDate),
          diagnosis: decryptPrescriptionData(data.diagnosis),
          note: decryptPrescriptionData(data.note),
          appointmentNo: decryptPrescriptionData(data.appointmentNumber),
          nicNo: doc.id, 
          medicines: data.medicines.map((med) => ({
            medicineName: decryptPrescriptionData(med.medicineName),
            instruction: decryptPrescriptionData(med.instruction),
            days: decryptPrescriptionData(med.days),
          })),
          createdDate: data.createdDate,
          completed: false // Add completed field
        };

        prescriptionsData.push(decryptedPrescription);
      });

      setPrescriptions(prescriptionsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError('Error fetching prescriptions: ' + error.message);
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
        (prescription.nicNo?.toLowerCase() || '').includes(searchText) ||
        (prescription.patient?.toLowerCase() || '').includes(searchText) ||
        (prescription.appointmentNo?.toLowerCase() || '').includes(searchText)
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

  const toggleCompleted = (id) => {
    setFilteredPrescriptions((prev) =>
      prev.map((prescription) =>
        prescription.id === id
          ? { ...prescription, completed: !prescription.completed }
          : prescription
      )
    );
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
          placeholder="Search by NIC, patient name, or appointment number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Prescription ID</th>
            <th>Patient Name</th>
            <th>Appointment No</th>
            <th>Prescription</th>
            <th>Status</th> {/* Add a new header for Status */}
          </tr>
        </thead>
        <tbody>
          {filteredPrescriptions.map((prescription) => (
            <tr key={prescription.id}>
              <td>{prescription.nicNo}</td>
              <td>{prescription.patient}</td>
              <td>{prescription.appointmentNo}</td>
              <td>
                <button onClick={() => handleViewPrescription(prescription.id)}>
                  View Prescription
                </button>
              </td>
              <td>
                <button
                  className={`status-button ${prescription.completed ? 'completed' : ''}`}
                  onClick={() => toggleCompleted(prescription.id)}
                >
                  {prescription.completed ? 'Completed' : 'Not Completed'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrescriptionsList;
