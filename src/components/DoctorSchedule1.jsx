import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DoctorSchedule1.css';

const DoctorSchedule1 = () => {
  const location = useLocation();
  const { doctorId } = location.state || {}; // Get doctorId from the state

  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]); // State to hold appointments data
  const [showModal, setShowModal] = useState(false); // State to toggle modal visibility
  const [appointmentCount, setAppointmentCount] = useState(0); // State to store appointment count

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!doctorId) return; // Check if doctorId is present

      try {
        const q = query(
          collection(db, `schedule/${doctorId}/schedules`)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const scheduleData = [];
          querySnapshot.forEach((doc) => {
            scheduleData.push({ id: doc.id, ...doc.data() }); // Add document data to the schedule array
          });
          setSchedule(scheduleData); // Update the schedule state
        });

        return () => unsubscribe(); // Cleanup listener
      } catch (error) {
        console.error('Error fetching schedule data: ', error);
      }
    };

    fetchSchedule();
  }, [doctorId]);

  const handleViewAppointments = async (appointmentDate) => {
    if (!doctorId || !appointmentDate) return; // Check for valid inputs

    try {
      const q = query(
        collection(db, 'Appointments'),
        where('doctorId', '==', doctorId),
        where('appointmentDate', '==', appointmentDate)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const appointmentData = [];
        querySnapshot.forEach((doc) => {
          appointmentData.push({ id: doc.id, ...doc.data() }); // Add document data to the appointment array
        });
        setAppointments(appointmentData); // Update the appointments state
        setAppointmentCount(appointmentData.length); // Update the appointment count
        setShowModal(true); // Show the modal
      });

      return () => unsubscribe(); // Cleanup listener
    } catch (error) {
      console.error('Error fetching appointments data: ', error);
    }
  };

  return (
    <div className="doctor-schedule-container">
      <div className="main-content">
        <div className="schedule-table">
          <table>
            <thead>
              <tr>
                <th>Appointment Date</th>
                <th>Visiting Time</th>
                <th>View Appointments</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? (
                schedule.map((app) => (
                  <tr key={app.id}>
                    <td>{app.appointmentDate}</td>
                    <td>{app.visitingTime}</td>
                    <td>
                      <button
                        className="view-appointments-btn"
                        onClick={() => handleViewAppointments(app.appointmentDate)}
                      >
                        View Appointments
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No schedule available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for displaying appointments */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Appointments</h3>
              <p>Total Appointments: {appointmentCount}</p>
              <table>
                <thead>
                  <tr>
                    <th>Appointment No</th>
                    <th>Patient Name</th>
                    <th>NIC</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.appointmentNumber}</td>
                        <td>{appointment.patientName}</td>
                        <td>{appointment.nic}</td>
                        <td>{appointment.phone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No appointments available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button
                className="close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <button className="back-button" onClick={() => window.history.back()}>Back</button>
      </div>
    </div>
  );
};

export default DoctorSchedule1;
