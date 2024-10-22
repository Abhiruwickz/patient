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
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsQuery = query(appointmentsCollection, orderBy('referenceNumber', 'desc'));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => doc.data());
        
        const latestReferenceNumber = appointmentsData.length > 0 ? Math.max(...appointmentsData.map(app => app.referenceNumber || 0)) : 0;
        const newReferenceNumber = latestReferenceNumber + 1; // Increment for the new reference number

        const appointmentData = {
          referenceNumber: newReferenceNumber,
          doctorPhotoUrl: appointmentDetails.doctorImage,
          doctorName: appointmentDetails.doctorName,
          doctorSpecialization: appointmentDetails.specialization,
          appointmentDate: appointmentDetails.appointmentDate,
          visitingTime: appointmentDetails.visitingTime,
          patientDetails: {
            name: personalDetails.patientName || 'N/A',
            phone: personalDetails.phone || 'N/A',
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
              <p><strong>Phone Number:</strong> {personalDetails.phone || 'N/A'}</p>
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

        <div className="terms-and-conditions">
          <h4>Terms and Conditions</h4>
          <p>
            By confirming your appointment, you agree to the following terms and conditions:
            <ul>
              <li>You must arrive on time for your scheduled appointment.</li>
              <li>If you need to cancel or reschedule, please do so at least 24 hours in advance.</li>
              <li>All personal information will be kept confidential.</li>
              <li>Our clinic is not responsible for missed appointments due to late arrivals.</li>
            </ul>
          </p>
          <div>
            <input 
              type="checkbox" 
              id="accept-terms" 
              checked={accepted} 
              onChange={handleAcceptTerms} 
            />
            <label htmlFor="accept-terms">
              I accept the terms and conditions.
            </label>
          </div>
        </div>

        <div className="confirmation-message">
          <p>{message}</p>
        </div>

        <button onClick={handleConfirmAppointment} disabled={loading || !accepted}>
          Confirm Appointment
        </button>
      </div>
    </div>
  );
}

export default Confirm;
