import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorId = location.state?.doctorId || localStorage.getItem('doctorId');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not available.');
      setLoading(false);
      return;
    }

    const fetchAppointments = () => {
      try {
        const q = query(
          collection(db, 'Appointments'),
          where('doctorId', '==', doctorId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const appointmentsData = [];
          querySnapshot.forEach((doc) => {
            appointmentsData.push({ id: doc.id, ...doc.data() });
          });
          setAppointments(appointmentsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments: ' + error.message);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  const handlePatientClick = (patientId) => {
    navigate(`/info`, { state: { patientId } });
  };

  const handleViewMedicalHistory = (appointment) => {
    if (appointment.nic) {
      navigate(`/MedicalHistory`, { state: { nicNo: appointment.nic } });
    } else {
      console.error('NIC number is not available for this appointment.');
    }
  };

  const handleSendPrescription = (appointment) => {
    navigate(`/prescription`, {
      state: {
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        appointmentNo: appointment.appointmentNumber,
        nicNo: appointment.nic,
      },
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <main className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl">
        <div className="flex flex-col gap-6">
          <div className="bg-blue-100 rounded-lg p-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-700">Select Patient</h3>
            <select className="border border-gray-300 rounded px-4 py-2">
              <option value="">Select</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.patientName}
                </option>
              ))}
            </select>
            <div className="bg-blue-100 rounded-lg text-center p-4">
              <p className="text-sm text-blue-700">Appointment Count</p>
              <span className="text-2xl font-bold text-blue-700">
                {appointments.length}
              </span>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-100 text-left">
                <th className="border border-gray-200 px-4 py-2">Appointment No</th>
                <th className="border border-gray-200 px-4 py-2">Patient Name</th>
                <th className="border border-gray-200 px-4 py-2">NIC</th>
                <th className="border border-gray-200 px-4 py-2">Phone Number</th>
                <th className="border border-gray-200 px-4 py-2">Medical History</th>
                <th className="border border-gray-200 px-4 py-2">Prescription</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-red-500">{error}</td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-100">
                    <td className="border border-gray-200 px-4 py-2">{appointment.appointmentNumber}</td>
                    <td
                      className="border border-gray-200 px-4 py-2 text-blue-700 cursor-pointer hover:underline"
                      onClick={() => handlePatientClick(appointment.id)}
                    >
                      {appointment.patientName}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{appointment.nic}</td>
                    <td className="border border-gray-200 px-4 py-2">{appointment.phone}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => handleViewMedicalHistory(appointment)}
                      >
                        View
                      </button>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => handleSendPrescription(appointment)}
                      >
                        Send Prescription
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No appointments available.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="text-right">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Appointment;
