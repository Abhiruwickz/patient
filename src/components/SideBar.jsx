import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Added 'Link' here
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FaUserMd, FaCalendarAlt, FaFileAlt, FaPills, FaCalendarCheck } from 'react-icons/fa';
import './SideBar.css';

const SideBar = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const doctorId = location.state?.doctorId || localStorage.getItem('doctorId'); // Get doctorId from state or localStorage

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
          setDoctorData(docSnap.data());
          localStorage.setItem('doctorId', doctorId); // Store doctorId in localStorage
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

  const handleNavigateToDashboard = () => {
    navigate('/dashboard', { state: { doctorId } });
  };

  const handleNavigateToDoctorSchedule = () => {
    navigate('/doctor-schedule', { state: { doctorId } });
  };

  const handleNavigateToAppointment = () => {
    navigate('/Appointment', { state: { doctorId } });
  };

  const handleNavigateToAddPrescription = () => {
    navigate('/prescription', { state: { doctorId } });
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="sidebar-profile">
          <img
            src={doctorData?.photo || './assets/placeholder-profile-pic.svg'}
            alt="Doctor Profile"
            className="sidebar-profile-pic"
          />
          <div className="sidebar-profile-info">
            <h2>{doctorData?.doctorName || 'Dr. Unknown'}</h2>
            <p>{doctorData?.biography || 'MBBS, MD'}</p>
          </div>
        </div>
      </div>
      <ul>
        <li>
          <div
            onClick={handleNavigateToDashboard}
            className={location.pathname === '/dashboard' ? 'active' : ''}
            style={{ cursor: 'pointer' }}
          >
            <FaUserMd className="icon" /> Dashboard
          </div>
        </li>
        <li>
          <div
            onClick={handleNavigateToDoctorSchedule}
            className={location.pathname === '/doctor-schedule' ? 'active' : ''}
            style={{ cursor: 'pointer' }}
          >
            <FaCalendarAlt className="icon" /> Doctor Schedule
          </div>
        </li>
        {/* <div
            onClick={handleNavigateToAddPrescription}
            className={location.pathname === '/prescription' ? 'active' : ''}
            style={{ cursor: 'pointer' }}
          >
            <FaFileAlt className="icon" /> Prescription
          </div> */}

        <li>
          <div
            onClick={handleNavigateToAppointment}
            className={location.pathname === '/Appointment' ? 'active' : ''}
            style={{ cursor: 'pointer' }}
          >
            <FaPills className="icon" /> Appointment
          </div>
        </li>
        {/* <li>
          <Link to="/MedicalHistory" className={location.pathname === '/MedicalHistory' ? 'active' : ''}>
            <FaCalendarCheck className="icon" /> Medical History
          </Link>
        </li> */}
      </ul>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SideBar;
