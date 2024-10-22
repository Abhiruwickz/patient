import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig'
import './DoctorSchedule1.css';

const DoctorSchedule1 = () => {
  const location = useLocation();
  const { doctorId } = location.state || {}; // Get doctorId from the state

  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!doctorId) return; // Check if doctorId is present

      try {
        const q = query(
          collection(db, `schedule/${doctorId}/schedules`),
          // Make sure the field name in Firebase is 'doctorId'
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

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleTimeChange = (e) => setSelectedTime(e.target.value);

  return (
    <div className="doctor-schedule-container">
      <div className="main-content">
        <div className="schedule-form">
          <div className="form-group">
            <label>Date:</label>
            <input type="date" className="input-box" value={selectedDate} onChange={handleDateChange} />
          </div>
          <div className="form-group">
            <label>Time:</label>
            <input type="time" className="input-box" value={selectedTime} onChange={handleTimeChange} />
          </div>
        </div>

        <div className="schedule-table">
          <table>
            <thead>
              <tr>
                <th>Appointment Date</th>
                <th>Visiting Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? (
                schedule.map((app) => (
                  <tr key={app.id}>
                    <td>{app.appointmentDate}</td>
                    <td>{app.visitingTime}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No schedule available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="calendar">
          <div className="calendar-header">
            <button className="prev-btn">{'<'}</button>
            <h3>April 2024</h3>
            <button className="next-btn">{'>'}</button>
          </div>
          <div className="calendar-content">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th>Sun</th>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                  <th>Sat</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td><td></td><td></td><td>05</td><td>06</td><td>07</td><td>08</td>
                </tr>
                <tr>
                  <td>09</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button className="back-button" onClick={() => window.history.back()}>Back</button>
      </div>
    </div>
  );
};

export default DoctorSchedule1;
