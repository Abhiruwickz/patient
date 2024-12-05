import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ensure your Firebase config is properly imported
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './ConfirmSlot.css';
import Header from '../header1/header1';
import emailjs from 'emailjs-com'; // Import EmailJS

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
            specialization: latestAppointment.doctorSpecialization || 'N/A',
            appointmentDate: latestAppointment.appointmentDate || 'N/A',
            visitingTime: latestAppointment.visitingTime || 'N/A',
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
    }, [handleTimeout]);

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
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsQuery = query(appointmentsCollection, orderBy('referenceNumber', 'desc'));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => doc.data());
        
        const latestReferenceNumber = appointmentsData.length > 0 ? Math.max(...appointmentsData.map(app => app.referenceNumber || 0)) : 0;
      //  const newReferenceNumber = latestReferenceNumber + 1; // Increment for the new reference number

        const appointmentData = {
          appointmentNumber: appointmentNumber || 'N/A', // Match the exact field name
          scheduleId: personalDetails.scheduleId || 'N/A', // Adjusted for compatibility
          doctorName: appointmentDetails.doctorName || 'N/A',
          specialization: appointmentDetails.specialization || 'N/A',
          appointmentDate: appointmentDetails.appointmentDate || 'N/A',
          visitingTime: appointmentDetails.visitingTime || 'N/A',
          patientName: personalDetails.patientName || 'N/A', // Direct patient name
          phone: personalDetails.phone || 'N/A',
          nic: personalDetails.nic || 'N/A',
          email: personalDetails.email || 'N/A',
          gender: personalDetails.gender || 'N/A',
          bloodGroup: personalDetails.bloodGroup || 'N/A',
          address: personalDetails.address || 'N/A',
        };

        // Save the appointment data to Firestore
        await addDoc(appointmentsCollection, appointmentData); // Add a new document to the collection

        // Prepare the notification data
        const notificationData = {
          patientName: personalDetails.patientName, // Save the patient's name separately
          doctorName: appointmentDetails.doctorName, // Save the doctor's name separately
          appointmentDate: appointmentDetails.appointmentDate, // Save the appointment date separately
          visitingTime: appointmentDetails.visitingTime, // Save the visiting time separately
          appointmentNumber: appointmentNumber, // Save the appointment number separately
          createdAt: new Date(), // Save the creation timestamp
        };

        // Save the notification to Firestore (in 'Notifications' collection)
        const notificationsCollection = collection(db, 'Notifications');
        await addDoc(notificationsCollection, notificationData);

        // Email sending logic using EmailJS
        const templateParams = {
          patientName: personalDetails.patientName, // Patient's name
          doctorName: appointmentDetails.doctorName,
          appointment_date: appointmentDetails.appointmentDate,
          appointmentNumber: appointmentNumber,
          visitingTime: appointmentDetails.visitingTime,
          doctorSpecialization: appointmentDetails.specialization,
          email: personalDetails.email, 
        };

        emailjs.send('service_bp6shxc', 'template_zihfxcv', templateParams, 'OdP_vbIDRBSVqEPG8')
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
        window.alert("Awesome! Your booking is complete.");
        navigate('/'); // Navigate to home or another page after confirmation
      } catch (error) {
        console.error('Error confirming appointment:', error);
        setMessage('Error confirming appointment.');
        window.alert("Oops! An error occurred. Please try again.");  
      }
    } else {
      setMessage('Appointment is unsuccessful. Please accept the terms and conditions');
    }
  };

  return (
   <div >
    <Header />
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Time Slot</h2>

      {appointmentDetails && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-lg mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={appointmentDetails.doctorImage}
              alt={appointmentDetails.doctorName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">{appointmentDetails.doctorName}</h3>
              <p className="text-sm text-gray-600">{appointmentDetails.specialization}</p>
            </div>
          </div>
          <div className="mt-4">
            <p>
              <strong className="text-gray-700">Appointment Date:</strong> {appointmentDetails.appointmentDate}
            </p>
            <p>
              <strong className="text-gray-700">Visiting Time:</strong> {appointmentDetails.visitingTime}
            </p>
            <p>
              <strong className="text-gray-700">Appointment Number:</strong>{' '}
              {appointmentNumber || 'Loading...'}
            </p>
          </div>
          <p className="text-red-500 mt-2">
            Complete the booking within{' '}
            <span className="font-bold">{`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}</span>{' '}
            minutes to avoid cancellation.
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg shadow-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h4>
        {loading ? (
          <p className="text-gray-500">Loading personal details...</p>
        ) : personalDetails ? (
          <div className="space-y-2">
            <p><strong className="text-gray-700">Reference No:</strong> {appointmentNumber || 'N/A'}</p>
            <p><strong className="text-gray-700">Patient's Name:</strong> {personalDetails.patientName || 'N/A'}</p>
            <p><strong className="text-gray-700">Phone Number:</strong> {personalDetails.phone || 'N/A'}</p>
            <p><strong className="text-gray-700">NIC:</strong> {personalDetails.nic || 'N/A'}</p>
            <p><strong className="text-gray-700">Email:</strong> {personalDetails.email || 'N/A'}</p>
            <p><strong className="text-gray-700">DOB:</strong> {personalDetails.dob || 'N/A'}</p>
            <p><strong className="text-gray-700">Gender:</strong> {personalDetails.gender || 'N/A'}</p>
            <p><strong className="text-gray-700">Blood Group:</strong> {personalDetails.bloodGroup || 'N/A'}</p>
            <p><strong className="text-gray-700">Address:</strong> {personalDetails.address || 'N/A'}</p>
            <p><strong className="text-gray-700">Allergies or Other:</strong> {personalDetails.allergies || '-'}</p>
          </div>
        ) : (
          <p className="text-gray-500">No personal details available.</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Terms and Conditions</h4>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>You must arrive on time for your scheduled appointment.</li>
          <li>If you need to cancel or reschedule, please do so at least 24 hours in advance.</li>
          <li>All personal information will be kept confidential.</li>
          <li>Our clinic is not responsible for missed appointments due to late arrivals.</li>
        </ul>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="accept-terms"
            checked={accepted}
            onChange={handleAcceptTerms}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="accept-terms" className="text-gray-700">
            I accept the terms and conditions.
          </label>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-red-500">{message}</p>
      </div>

      <div className="text-center">
        <button
          onClick={handleConfirmAppointment}
          disabled={loading || !accepted}
          className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md ${
            accepted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  </div>
);
}

export default Confirm;
