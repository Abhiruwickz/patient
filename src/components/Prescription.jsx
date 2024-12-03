import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import './Prescription.css';

const AddPrescription = () => {
  const location = useLocation();
  const { appointmentNo, patientName, nicNo } = location.state || {}; // Get NIC number from navigation state
  const navigate = useNavigate();
  const [patient, setPatient] = useState(patientName || ''); // Auto-fill patient name
  const [nic, setNic] = useState(nicNo || ''); // Auto-fill NIC number

  const doctorId = 'your-doctor-id'; // Replace with actual doctor ID retrieval method
  const [doctorName] = useState('Dr. Umesha De Silva');
  const [biography] = useState('M.B.B.S., M.D., M.S. | Reg. No: D07');
  const [contactNo] = useState('0719878689');
  const [prescriptionDate, setPrescriptionDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [note, setNote] = useState('');

  const [medicinesList, setMedicinesList] = useState([]);
  const [inputMedicineName, setInputMedicineName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [medicineType, setMedicineType] = useState('');
  const [instruction, setInstruction] = useState('');
  const [days, setDays] = useState('');

  // Fetch medicines from Firestore
  useEffect(() => {
    const fetchMedicines = async () => {
      const medicineCollection = collection(db, 'Medicine');
      const medicineSnapshot = await getDocs(medicineCollection);
      const fetchedMedicines = medicineSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMedicinesList(fetchedMedicines);
    };

    fetchMedicines();
  }, []);

  const handleMedicineChange = (e) => {
    const value = e.target.value;
    setInputMedicineName(value);

    if (value.length > 0) {
      const filteredSuggestions = medicinesList.filter((med) =>
        med.medicineName && med.medicineName.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setActiveSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectMedicine = (medicine) => {
    setInputMedicineName(medicine.medicineName);
    setSelectedMedicine(medicine);
    setMedicineType(medicine.medicineType);
    setSuggestions([]);
  };

  const handleAddMedicine = () => {
    if (inputMedicineName) {
      const newMedicine = {
        medicineName: inputMedicineName,
        medicineType,
        instruction,
        days,
      };

      setAddedMedicines((prev) => [...prev, newMedicine]);

      setInputMedicineName('');
      setMedicineType('');
      setInstruction('');
      setDays('');
      setSelectedMedicine(null);
      setSuggestions([]);
    }
  };

  // Handle keypress events for suggestions
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelectMedicine(suggestions[activeSuggestionIndex]);
    } else if (e.key === 'ArrowUp') {
      if (activeSuggestionIndex > 0) {
        setActiveSuggestionIndex((prevIndex) => prevIndex - 1);
      }
    } else if (e.key === 'ArrowDown') {
      if (activeSuggestionIndex < suggestions.length - 1) {
        setActiveSuggestionIndex((prevIndex) => prevIndex + 1);
      }
    }
  };

  const handleSendPrescription = () => {
    navigate('/summary', {
      state: {
        patient,
        prescriptionDate,
        diagnosis,
        note,
        medicines: addedMedicines,
        doctorName,
        biography,
        contactNo,
        appointmentNo,
        nicNo: nic, // Pass NIC number to summary page
      },
    });
  };

  return (
    <div className="add-prescription-container">
      <h1>Add Prescription</h1>

      <div className="form-group">
        <label>Patient Name *</label>
        <input type="text" value={patient} disabled /> {/* Disabled input field for auto-filled patient */}
      </div>

      <div className="form-group">
        <label>Appointment No *</label>
        <input
          type="text"
          value={appointmentNo}
          disabled // Disabled as it's auto-filled
        />
      </div>

      <div className="form-group">
        <label>NIC No *</label>
        <input
          type="text"
          value={nic}
          disabled // Disabled as it's auto-filled
        />
      </div>

      <div className="form-group">
        <label>Prescription Date *</label>
        <input
          type="date"
          value={prescriptionDate}
          onChange={(e) => setPrescriptionDate(e.target.value)}
          required
        />
      </div>

      <h3>Medicine</h3>
      <div className="medicine-form">
        <input
          type="text"
          value={inputMedicineName}
          onChange={handleMedicineChange}
          onKeyDown={handleKeyPress} // Attach handleKeyPress for keyboard navigation
          placeholder="Medicine Name"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((med, index) => (
              <li
                key={med.id}
                className={index === activeSuggestionIndex ? 'active' : ''}
                onClick={() => handleSelectMedicine(med)}
              >
                {med.medicineName}
              </li>
            ))}
          </ul>
        )}
        <input
          type="text"
          value={medicineType}
          onChange={(e) => setMedicineType(e.target.value)} // Update medicine type here
          placeholder="Medicine Type"
        />

        <input
          type="text"
          id="instruction"
          value={instruction}
          placeholder="Instruction"
          onChange={(e) => setInstruction(e.target.value)} // Handle input change
        />
        <input
          type="text"
          id="days"
          value={days}
          placeholder="Days"
          onChange={(e) => setDays(e.target.value)} // Handle input change
        />
        <button onClick={handleAddMedicine}>Add Medicine</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Medicine Type</th>
            <th>Instruction</th>
            <th>Days</th>
          </tr>
        </thead>
        <tbody>
          {addedMedicines.map((med, index) => (
            <tr key={index}>
              <td>{med.medicineName}</td>
              <td>{med.medicineType}</td>
              <td>{med.instruction}</td>
              <td>{med.days}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-group">
        <label>Diagnosis *</label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button onClick={handleSendPrescription}>Send Prescription</button>
    </div>
  );
};

export default AddPrescription;
