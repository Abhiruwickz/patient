import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const NewAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { doctorId, appointmentDate } = location.state || {};
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId || !appointmentDate) {
      setError('Doctor ID or Appointment Date not available.');
      setLoading(false);
      return;
    }

    const fetchAppointments = () => {
      try {
        const q = query(
          collection(db, 'Appointments'),
          where('doctorId', '==', doctorId),
          where('appointmentDate', '==', appointmentDate)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const appointmentsData = [];
          querySnapshot.forEach((doc) => {
            appointmentsData.push({ id: doc.id, ...doc.data() });
          });
          setAppointments(appointmentsData);
          setFilteredAppointments(appointmentsData);
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
  }, [doctorId, appointmentDate]);

  const handlePatientClick = (patientId) => {
    navigate('/info', { state: { patientId } });
  };

  const handleViewMedicalHistory = (appointment) => {
    if (appointment.nic) {
      navigate('/MedicalHistory', { state: { nicNo: appointment.nic } });
    } else {
      console.error('NIC number is not available for this appointment.');
    }
  };

  const handleSendPrescription = (appointment) => {
    navigate('/prescription', { 
      state: { 
        appointmentId: appointment.id, 
        patientName: appointment.patientName, 
        appointmentNo: appointment.appointmentNumber,
        nicNo: appointment.nic
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-6">
      <main className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Appointments for {appointmentDate}
        </h3>
        <div className="flex justify-between items-center mb-6">
          <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow">
            <p className="text-sm">Appointment Count</p>
            <span className="text-lg font-bold">{filteredAppointments.length}</span>
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>
        <table className="w-full table-auto bg-gray-50 rounded-lg shadow overflow-hidden">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-black">
            <tr>
              <th className="px-4 py-2 text-left">Appointment No</th>
              <th className="px-4 py-2 text-left">Patient Name</th>
              <th className="px-4 py-2 text-left">NIC</th>
              <th className="px-4 py-2 text-left">Phone Number</th>
              <th className="px-4 py-2">Medical History</th>
              <th className="px-4 py-2">Prescription</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center text-red-500 py-4">
                  {error}
                </td>
              </tr>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="odd:bg-gray-100">
                  <td className="px-4 py-2">{appointment.appointmentNumber}</td>
                  <td
                    onClick={() => handlePatientClick(appointment.id)}
                    className="px-4 py-2 text-blue-600 hover:underline cursor-pointer"
                  >
                    {appointment.patientName}
                  </td>
                  <td className="px-4 py-2">{appointment.nic}</td>
                  <td className="px-4 py-2">{appointment.phone}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                      onClick={() => handleViewMedicalHistory(appointment)}
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                      onClick={() => handleSendPrescription(appointment)}
                    >
                      Send Prescription
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No appointments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default NewAppointment;
