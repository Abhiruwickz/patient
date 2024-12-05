import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ensure your Firebase config is properly imported
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './ConfirmSlot.css';
import Header from '../header1/header1';
import emailjs from 'emailjs-com'; // Import EmailJS
import Navbar from '../home/navbar/navbar';

function Confirm() {
  const [accepted, setAccepted] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [timer, setTimer] = useState(300); // Countdown timer initialized to 300 seconds (5 minutes)
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate for navigation

  useEffect(() => {
    const fetchLatestAppointmentDetails = async () => {
      try {
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsQuery = query(appointmentsCollection, orderBy('createdAt', 'desc'));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
    
        if (appointmentsData.length > 0) {
          const latestAppointment = appointmentsData[0];
          const extractedAppointmentNumber = latestAppointment.appointmentNumber
            ? latestAppointment.appointmentNumber.split('-')[3]
            : 'N/A';
    
          setAppointmentNumber(extractedAppointmentNumber);
          setPersonalDetails(latestAppointment || {});
          setAppointmentDetails({
            doctorImage: latestAppointment.doctorPhotoUrl || 'path/to/placeholder-image.jpg',
            doctorName: latestAppointment.doctorName || 'N/A',
            specialization: latestAppointment.specialization || 'N/A',
            appointmentDate: latestAppointment.appointmentDate || 'N/A',
            visitingTime: latestAppointment.appointmentTime || 'N/A',
          });
        } else {
          console.error('No appointments found!');
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestAppointmentDetails();

    // Timer countdown logic
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleTimeout(); // Call function to handle timeout
          return 0; // Set to 0 when time is up
        }
        return prev - 1; // Decrease by 1 second
      });
    }, 1000);

    return () => clearInterval(countdown); // Cleanup on component unmount
  }, []);

  const handleTimeout = () => {
    navigate('/doctors'); // Navigate to /doctors when timer hits 0
  };

  const handleAcceptTerms = () => {
    setAccepted(!accepted);
  };

  const handleConfirmAppointment = async () => {
    if (accepted) {
      try {
        // Prepare the notification data
        const notificationData = {
          patientName: personalDetails.patientName,
          doctorName: appointmentDetails.doctorName,
          appointmentDate: appointmentDetails.appointmentDate,
          visitingTime: appointmentDetails.visitingTime,
          appointmentNumber: appointmentNumber,
          createdAt: new Date(),
        };

        // Save the notification to Firestore (in 'Notifications' collection)
        const notificationsCollection = collection(db, 'Notifications');
        await addDoc(notificationsCollection, notificationData);

        // Email sending logic using EmailJS
        const templateParams = {
          patientName: personalDetails.patientName,
          doctorName: appointmentDetails.doctorName,
          appointmentDate: appointmentDetails.appointmentDate,
          appointmentNumber: appointmentNumber,
          updatedStartTime: appointmentDetails.visitingTime,
          specialization: appointmentDetails.specialization,
          user: personalDetails.email, 
        };

        emailjs.send('service_i9ex7wq', 'template_ag587il', templateParams, 'A91oWWrbRwEuHxKhD')
          .then((response) => {
            console.log('Email successfully sent!', response.status, response.text);
            setMessage('Appointment confirmed and email sent successfully!');
            window.alert('Appointment confirmed and email sent successfully!'); // Pop-up message
          })
          .catch((err) => {
            console.error('Failed to send email:', err);
            setMessage('Error sending email.');
          });

        setMessage('Appointment confirmed successfully!');
        navigate('/'); // Navigate to home or another page after confirmation
      } catch (error) {
        console.error('Error confirming appointment:', error);
        setMessage('Error confirming appointment.');
      }
    } else {
      setMessage('Appointment is unsuccessful. Please accept the terms and conditions');
    }
  };

  return (
    <div className="confirm-slot-container bg-gray-100 min-h-screen flex flex-col items-center py-8">
  <Navbar />

  <div className="confirm-slot-content bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl mt-8">
    <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Confirm Time Slot</h2>

    {appointmentDetails && (
      <div className="doctor-info-card flex flex-col md:flex-row items-start md:items-center md:space-x-8 mb-8 p-6 bg-gray-50 rounded-xl shadow-md">
        <img
          src={appointmentDetails.doctorImage}
          alt={appointmentDetails.doctorName}
          className="doctor-image w-32 h-32 rounded-full object-cover mb-4 md:mb-0"
        />
        <div className="doctor-details flex flex-col text-center md:text-left">
          <h2 className="text-2xl font-semibold text-gray-800">{appointmentDetails.doctorName}</h2>
          <p className="text-gray-600">{appointmentDetails.specialization}</p>
        </div>
        <div className="appointment-summary mt-4 md:mt-0 text-center md:text-right space-y-2">
          <p className="text-lg font-medium text-blue-600">{appointmentDetails.appointmentDate}</p>
          <p className="text-sm text-gray-600">Appointment Number: {appointmentNumber || 'Loading...'}</p>
          <p className="appointment-warning text-sm text-red-600">
            Complete the booking within the given time to avoid cancellation
          </p>
          <p className="appointment-time-left text-xl font-semibold mt-4 text-green-600">
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </p>
        </div>
      </div>
    )}

    <div className=" mb-8 p-6 bg-slate-200 rounded-xl shadow-md">
      <h4 className="text-2xl font-semibold text-gray-800 mb-4">Personal Details:</h4>
      {loading ? (
        <p className="text-gray-600">Loading personal details...</p>
      ) : personalDetails ? (
        <div className="space-y-4 text-gray-700">
          <p><strong>Reference No:</strong> {appointmentNumber || 'N/A'}</p>
          <p><strong>Patient's Name:</strong> {personalDetails.patientName || 'N/A'}</p>
          <p><strong>Phone Number:</strong> {personalDetails.phone || 'N/A'}</p>
          <p><strong>NIC:</strong> {personalDetails.nic || 'N/A'}</p>
          <p><strong>Email:</strong> {personalDetails.email || 'N/A'}</p>
          <p><strong>DOB:</strong> {personalDetails.dob || 'N/A'}</p>
          <p><strong>Gender:</strong> {personalDetails.gender || 'N/A'}</p>
          <p><strong>Blood Group:</strong> {personalDetails.bloodGroup || 'N/A'}</p>
          <p><strong>Address:</strong> {personalDetails.address || 'N/A'}</p>
          <p><strong>Allergies or Other:</strong> {personalDetails.allergies || '-'}</p>
        </div>
      ) : (
        <p className="text-gray-600">No personal details available.</p>
      )}
    </div>

    <div className="terms-and-conditions mb-8 p-6 bg-gray-50 rounded-xl shadow-md">
      <h4 className="text-2xl font-semibold text-gray-800 mb-4">Terms and Conditions</h4>
      <p className="text-gray-600 mb-4">
        By confirming your appointment, you agree to the following terms and conditions:
        <ul className="list-disc pl-5 mt-2 text-gray-700">
          <li>You must arrive on time for your scheduled appointment.</li>
          <li>If you need to cancel or reschedule, please do so at least 24 hours in advance.</li>
          <li>Failure to attend your appointment may result in a cancellation fee.</li>
        </ul>
      </p>
      <label className="inline-flex items-center mt-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={handleAcceptTerms}
          className="form-checkbox text-blue-600"
        />
        <span className="ml-2 text-gray-600">I accept the terms and conditions.</span>
      </label>
    </div>

    {message && <p className="confirmation-message text-green-600 text-lg font-semibold mt-4">{message}</p>}

    <button
      onClick={handleConfirmAppointment}
      disabled={!accepted || loading}
      className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg disabled:bg-gray-400"
    >
      Confirm Appointment
    </button>
  </div>
</div>

  
  );
}

export default Confirm;
