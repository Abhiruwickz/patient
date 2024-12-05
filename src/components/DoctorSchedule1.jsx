import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DoctorSchedule1.css';

const DoctorSchedule1 = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { doctorId } = location.state || {}; // Get doctorId from the state

  const [schedule, setSchedule] = useState([]);

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

  const handleViewAppointments = (appointmentDate) => {
    if (!doctorId || !appointmentDate) return; // Check for valid inputs

    // Navigate to the /newfilteredAppointment page and pass appointmentDate and doctorId as state
    navigate('/newfilteredAppointment', { state: { appointmentDate, doctorId } });
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

        <button className="back-button" onClick={() => window.history.back()}>Back</button>
      </div>
    </div>
  );
};

export default DoctorSchedule1;