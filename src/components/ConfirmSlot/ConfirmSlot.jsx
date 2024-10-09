import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ensure your Firebase config is properly imported
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './ConfirmSlot.css';
import Header from '../header1/header1';

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
          setAppointmentNumber(latestAppointment.appointmentNumber || 'N/A');
          setPersonalDetails(latestAppointment || {});
          setAppointmentDetails({
            doctorImage: latestAppointment.doctorPhotoUrl || 'path/to/placeholder-image.jpg',
            doctorName: latestAppointment.doctorName || 'N/A',
            specialization: latestAppointment.doctorSpecialization || 'N/A',
            appointmentDate: latestAppointment.appointmentDate || 'N/A',
            visitingTime: latestAppointment.visitingTime || 'N/A',
          });
          console.log('Fetched latest appointment details:', latestAppointment);
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
        // Fetch the current highest reference number
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsQuery = query(appointmentsCollection, orderBy('referenceNumber', 'desc'));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => doc.data());
        
        const latestReferenceNumber = appointmentsData.length > 0 ? Math.max(...appointmentsData.map(app => app.referenceNumber || 0)) : 0;
        const newReferenceNumber = latestReferenceNumber + 1; // Increment for the new reference number

        // Prepare appointment data with the new reference number
        const appointmentData = {
          referenceNumber: newReferenceNumber, // Use the new reference number
          doctorPhotoUrl: appointmentDetails.doctorImage,
          doctorName: appointmentDetails.doctorName,
          doctorSpecialization: appointmentDetails.specialization,
          appointmentDate: appointmentDetails.appointmentDate,
          visitingTime: appointmentDetails.visitingTime,
          patientDetails: { // Store patient details as an object
            name: personalDetails.patientName || 'N/A',
            phone: personalDetails.contactNo || 'N/A',
            nic: personalDetails.nic || 'N/A',
            email: personalDetails.email || 'N/A',
            dob: personalDetails.dob || 'N/A',
            gender: personalDetails.gender || 'N/A',
            bloodGroup: personalDetails.bloodGroup || 'N/A',
            address: personalDetails.address || 'N/A',
            allergies: personalDetails.allergies || '-',
          },
          appointmentNumber: appointmentNumber, // Store the appointment number
          createdAt: new Date(), // Save the creation timestamp
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

        setMessage('Appointment confirmed successfully!');
        navigate('/');
      } catch (error) {
        console.error('Error confirming appointment:', error);
        setMessage('Error confirming appointment.');
      }
    } else {
      setMessage('Appointment is unsuccessful. Please accept the terms and conditions');
    }
  };

  return (
    <div className="confirm-slot-container">
      <Header />

      <div className="confirm-slot-content">
        <h2>Confirm Time Slot</h2>

        {appointmentDetails && (
          <div className="doctor-info-card">
            <img src={appointmentDetails.doctorImage} alt={appointmentDetails.doctorName} className="doctor-image" />
            <div className="doctor-details">
              <h2>{appointmentDetails.doctorName}</h2>
              <p>{appointmentDetails.specialization}</p>
            </div>
            <div className="appointment-summary">
              <p><strong>{appointmentDetails.appointmentDate}</strong></p>
              <p>Appointment Number: {appointmentNumber || 'Loading...'}</p>
              <p className="appointment-warning">Complete the booking within the given time to avoid cancellation</p>
              <p className="appointment-time-left">{`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}</p>
            </div>
          </div>
        )}

        <div className="patient-details">
          <h4>Personal Details</h4>
          {loading ? (
            <p>Loading personal details...</p>
          ) : personalDetails ? (
            <>
              <p><strong>Reference No:</strong> {appointmentNumber || 'N/A'}</p>
              <p><strong>Patient's Name:</strong> {personalDetails.patientName || 'N/A'}</p>
              <p><strong>Phone Number:</strong> {personalDetails.contactNo || 'N/A'}</p>
              <p><strong>NIC:</strong> {personalDetails.nic || 'N/A'}</p>
              <p><strong>Email:</strong> {personalDetails.email || 'N/A'}</p>
              <p><strong>DOB:</strong> {personalDetails.dob || 'N/A'}</p>
              <p><strong>Gender:</strong> {personalDetails.gender || 'N/A'}</p>
              <p><strong>Blood Group:</strong> {personalDetails.bloodGroup || 'N/A'}</p>
              <p><strong>Address:</strong> {personalDetails.address || 'N/A'}</p>
              <p><strong>Allergies or Other:</strong> {personalDetails.allergies || '-'}</p>
            </>
          ) : (
            <p>No personal details available.</p>
          )}
        </div>

        <div className="appointment-details">
          <h4>Appointment Details</h4>
          <p><strong>Appointment Time:</strong> {appointmentDetails ? appointmentDetails.appointmentDate : 'Loading...'}</p>
          <p><strong>Visiting Time:</strong> {appointmentDetails ? appointmentDetails.visitingTime : 'Loading...'}</p>
        </div>

        <div className="terms-and-conditions">
          <h4>Terms & Conditions</h4>
          <ul>
            <li>All customers using MediConnect Channeling shall have read and agreed to the terms and conditions.</li>
            <li>Terms and conditions apply when scheduling appointments via the website.</li>
            <li>Customers are not responsible for the quality of advice provided by the doctor.</li>
            <li>Customers are responsible for the accuracy of personal information when scheduling appointments.</li>
            <li>Appointment times may change without notice.</li>
            <li>Payment will not be refunded except in certain cases.</li>
          </ul>
        </div>

        <div className="accept-terms">
          <label>
            <input
              type="checkbox"
              checked={accepted}
              onChange={handleAcceptTerms}
            />
            I agree to the terms and conditions.
          </label>
        </div>

        <div className="confirm-buttons">
          <button className="confirm-button" onClick={handleConfirmAppointment}>
            Confirm Appointment
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Confirm;
