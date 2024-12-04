import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
  const location = useLocation();
  const { doctorId } = location.state || {};

  const [totalAppointments, setTotalAppointments] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [appointments, setAppointments] = useState([]); // Patient appointments list
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the calendar

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) return;

      try {
        const q = query(collection(db, 'Appointments'), where('doctorId', '==', doctorId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const today = new Date().toISOString().split('T')[0];
          let total = 0;
          let todayCount = 0;
          const appointmentsList = []; // Track all appointments

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt;

            if (!createdAt || typeof createdAt.toDate !== 'function') {
              console.warn(`Document with ID ${doc.id} is missing a valid 'createdAt' field.`);
              return;
            }

            total += 1;
            const appointmentDate = createdAt.toDate().toISOString().split('T')[0];

            if (appointmentDate === today) {
              todayCount += 1;
            }

            // Add to appointments list with the visitingTime as timeSlot
            appointmentsList.push({
              id: doc.id,
              patientName: data.patientName || "Unknown", // Handle missing patientName
              date: createdAt.toDate().toLocaleDateString(),
              timeSlot: data.visitingTime || "Not Specified", // Use visitingTime for the timeSlot
            });
          });

          setTotalAppointments(total);
          setAppointmentsToday(todayCount);
          setAppointments(appointmentsList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching appointments data: ', error);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // Filter appointments by the selected calendar date
  const filteredAppointments = appointments.filter((appointment) => {
    return new Date(appointment.date).toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Appointment Summary Cards */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700">Appointments Today</h3>
          <p className="text-2xl font-bold text-blue-600">{appointmentsToday}</p>
          <img src="icon1.png" alt="icon" className="w-16 h-16 mt-2" />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700">Total Appointments</h3>
          <p className="text-2xl font-bold text-blue-600">{totalAppointments}</p>
          <img src="icon2.png" alt="icon" className="w-16 h-16 mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 w-full max-w-5xl">
        {/* Patient Table */}
        <div className="bg-white shadow-md rounded-lg p-6 overflow-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Appointments on {selectedDate.toDateString()}</h3>
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Patient Name</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time Slot</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-100">
                    <td className="p-2 border">{appointment.patientName}</td>
                    <td className="p-2 border">{appointment.date}</td>
                    <td className="p-2 border">{appointment.timeSlot}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 p-4">
                    No appointments for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calendar */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Calendar</h3>
          <Calendar
            className="w-full"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

