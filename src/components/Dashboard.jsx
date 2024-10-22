import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Dashboard.css';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const location = useLocation();
  const { doctorId } = location.state || {};

  const [totalAppointments, setTotalAppointments] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]); // New state for monthly data

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) return;

      try {
        const q = query(collection(db, 'Appointments'), where('doctorId', '==', doctorId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
          let total = 0;
          let todayCount = 0;
          const monthCounts = {}; // To hold counts for each day of the current month

          const currentMonth = new Date().getMonth(); // Get current month (0-11)
          const currentYear = new Date().getFullYear(); // Get current year

          querySnapshot.forEach((doc) => {
            total += 1; // Increment total appointments count
            const appointmentDate = doc.data().createdAt.toDate(); // Convert Firestore Timestamp to Date object

            // Check if the appointment is from the current month and year
            if (appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear) {
              const dateKey = appointmentDate.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
              monthCounts[dateKey] = (monthCounts[dateKey] || 0) + 1; // Increment count for the specific date

              // Check if the appointment date matches today's date
              if (dateKey === today) {
                todayCount += 1; // Increment today's appointments count
              }
            }
          });

          setTotalAppointments(total); // Update total appointments state
          setAppointmentsToday(todayCount); // Update today's appointments state

          // Prepare monthly data for the chart
          const monthData = Object.keys(monthCounts).map(date => ({
            date: date,
            count: monthCounts[date],
          }));

          setMonthlyData(monthData); // Set monthly data for the chart
        });

        return () => unsubscribe(); // Cleanup subscription on component unmount
      } catch (error) {
        console.error('Error fetching appointments data: ', error);
      }
    };

    fetchAppointments(); // Call the fetch function
  }, [doctorId]);

  // Prepare data for the chart
  const chartData = monthlyData.map(item => ({
    date: item.date, // Keep the full date
    appointments: item.count,
  }));

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="cards">
          <div className="card">
            <h3>Appointments Today</h3>
            <p>{appointmentsToday}</p>
            <img src="icon1.png" alt="icon" />
          </div>
          <div className="card">
            <h3>Total Appointments</h3>
            <p>{totalAppointments}</p>
            <img src="icon2.png" alt="icon" />
          </div>
        </div>

        <div className="dashboard-bottom">
          <div className="calendar">
            <div className="calendar-header">
              <h3>Appointments Overview</h3>
              <p>Showing appointments for the month</p>
            </div>
            <div className="calendar-content">
            <BarChart width={300} height={300} data={chartData}>
              <XAxis dataKey="date" tickFormatter={(date) => {
                const options = { month: 'short', day: 'numeric' }; // Format for the date display
                return new Date(date).toLocaleDateString(undefined, options); // Format the date to show "MMM DD"
              }} />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="appointments" fill="#8884d8" />
            </BarChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
