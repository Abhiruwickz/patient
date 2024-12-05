import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from '../home/navbar/navbar';
import emailjs from 'emailjs-com';

function Confirm() {
  const [accepted, setAccepted] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [timer, setTimer] = useState(300);
  const [popup, setPopup] = useState({ visible: false, type: '', message: '' }); // Popup state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestAppointmentDetails = async () => {
      try {
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsQuery = query(appointmentsCollection, orderBy('createdAt', 'desc'));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
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
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAppointmentDetails();

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          navigate('/doctors');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleAcceptTerms = () => {
    setAccepted(!accepted);
  };

  const handleConfirmAppointment = async () => {
    if (accepted) {
      try {
        const notificationData = {
          patientName: personalDetails.patientName,
          doctorName: appointmentDetails.doctorName,
          appointmentDate: appointmentDetails.appointmentDate,
          visitingTime: appointmentDetails.visitingTime,
          appointmentNumber: appointmentNumber,
          createdAt: new Date(),
        };

        const notificationsCollection = collection(db, 'Notifications');
        await addDoc(notificationsCollection, notificationData);

        const templateParams = {
          patientName: personalDetails.patientName,
          doctorName: appointmentDetails.doctorName,
          appointmentDate: appointmentDetails.appointmentDate,
          appointmentNumber: appointmentNumber,
          updatedStartTime: appointmentDetails.visitingTime,
          specialization: appointmentDetails.specialization,
          user: personalDetails.email,
        };

        await emailjs.send('service_i9ex7wq', 'template_ag587il', templateParams, 'A91oWWrbRwEuHxKhD');

        setPopup({
          visible: true,
          type: 'success',
          message: 'Appointment confirmed and email sent successfully!',
        });
      } catch (error) {
        setPopup({
          visible: true,
          type: 'error',
          message: 'Oops! An error occurred while confirming your appointment.',
        });
        console.error('Error confirming appointment:', error);
      }
    } else {
      setPopup({
        visible: true,
        type: 'error',
        message: 'Please accept the terms and conditions to confirm your appointment.',
      });
    }
  };

  const closePopup = () => {
    setPopup({ visible: false, type: '', message: '' });
    if (popup.type === 'success') navigate('/');
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

        <button
          onClick={handleConfirmAppointment}
          disabled={!accepted || loading}
          className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg disabled:bg-gray-400"
        >
          Confirm Appointment
        </button>
      </div>

      {popup.visible && (
        <div className="popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`popup-content p-6 rounded-lg shadow-lg bg-white ${popup.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <h2 className={`text-lg font-semibold ${popup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {popup.type === 'success' ? 'Success!' : 'Error!'}
            </h2>
            <p className="mt-2 text-gray-700">{popup.message}</p>
            <button
              onClick={closePopup}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Confirm;
