import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    <div className="flex min-h-screen">
      <div className="sidebar bg-indigo-700 text-white w-60 flex flex-col py-0">
        <div className="logo-container flex justify-center items-center mt-2 mb-2">
          <div className="sidebar-profile flex flex-col items-center text-center">
            <img
              src={doctorData?.photo || './assets/placeholder-profile-pic.svg'}
              alt="Doctor Profile"
              className="sidebar-profile-pic w-40 h- rounded-full mb-2"
            />
            <div className="sidebar-profile-info text-white">
              <h2 className="text-lg">{doctorData?.doctorName || 'Dr. Unknown'}</h2>
              <p className="text-sm">{doctorData?.biography || 'MBBS, MD'}</p>
            </div>
          </div>
        </div>
        <ul className="flex flex-col p-0 m-0 w-full">
  <li>
    <div
      onClick={handleNavigateToDashboard}
      className={`p-3 flex items-center cursor-pointer ${location.pathname === '/dashboard' ? 'bg-indigo-600' : ''}`}
    >
      <FaUserMd className="icon mr-2 text-lg" /> Dashboard
    </div>
  </li>
  <li>
    <div
      onClick={handleNavigateToDoctorSchedule}
      className={`p-3 flex items-center cursor-pointer ${location.pathname === '/doctor-schedule' ? 'bg-indigo-600' : ''}`}
    >
      <FaCalendarAlt className="icon mr-2 text-lg" /> Doctor Schedule
    </div>
  </li>
  <li>
    <div
      onClick={handleNavigateToAppointment}
      className={`p-3 flex items-center cursor-pointer ${location.pathname === '/Appointment' ? 'bg-indigo-600' : ''}`}
    >
      <FaPills className="icon mr-2 text-lg" /> Appointment
    </div>
  </li>
</ul>

        {loading && <p className="text-center text-white">Loading...</p>}
        {error && <p className="error text-center text-red-600 bg-red-200 p-2">{error}</p>}
      </div>
      {/* The rest of the content here */}
    </div>
  );
};

export default SideBar;
