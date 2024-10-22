import React, { useEffect, useState } from 'react';
import { FaUser, FaPrescriptionBottle } from 'react-icons/fa';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Ensure correct path to firebase config
import './Dashboard_pharmacy.css'; // Ensure this CSS file is correctly imported
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components
import Calendar from 'react-calendar'; // Import react-calendar
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

const Dashboard = () => {
    const [patientCount, setPatientCount] = useState(0);
    const [prescriptionCount, setPrescriptionCount] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // For calendar date selection

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch patient count
                const appointmentsCollection = collection(db, 'Appointments');
                const appointmentsSnapshot = await getDocs(appointmentsCollection);
                setPatientCount(appointmentsSnapshot.docs.length);

                // Fetch prescription data
                const prescriptionsCollection = collection(db, 'prescriptions');
                const prescriptionsSnapshot = await getDocs(prescriptionsCollection);
                setPrescriptionCount(prescriptionsSnapshot.size);

                const prescriptionsByDay = {
                    Monday: 0,
                    Tuesday: 0,
                    Wednesday: 0,
                    Thursday: 0,
                    Friday: 0,
                    Saturday: 0,
                    Sunday: 0,
                };

                // Process each prescription document
                prescriptionsSnapshot.docs.forEach(prescription => {
                    const prescriptionData = prescription.data();
                    const prescriptionDate = prescriptionData.prescriptionDate; // Assuming prescriptionDate is a valid timestamp

                    if (!prescriptionDate) {
                        console.error("Invalid or missing prescriptionDate:", prescriptionDate);
                        return;
                    }

                    const dateObject = prescriptionDate.toDate(); // Convert Firestore timestamp to JS Date object

                    // Get the weekday name (e.g., Monday, Tuesday, etc.)
                    const weekday = getWeekdayName(dateObject);

                    // Increment the count for the respective weekday
                    if (prescriptionsByDay[weekday] !== undefined) {
                        prescriptionsByDay[weekday] += 1;
                    }
                });

                // Format data for the chart
                const formattedChartData = Object.keys(prescriptionsByDay).map(weekday => ({
                    weekday,
                    prescriptions: prescriptionsByDay[weekday],
                }));

                setChartData(formattedChartData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchCounts(); // Call fetchCounts to get data
    }, []);

    // Helper function to get the full weekday name from a Date object
    const getWeekdayName = (date) => {
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date); // Returns full weekday name (e.g., "Monday")
    };

    return (
        <div className="dashboard">
            <div className="stats">
                <div className="stat-item">
                    <FaUser size={50} />
                    <div>
                        <div>{patientCount}</div>
                        <div>Patients</div>
                    </div>
                </div>
                <div className="stat-item">
                    <FaPrescriptionBottle size={50} />
                    <div>
                        <div>{prescriptionCount}</div>
                        <div>Prescriptions</div>
                    </div>
                </div>
            </div>

            <div className="charts">
                <div className="chart-calendar-container">
                    <div className="chart">
                        <h3>Weekly Progress</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="weekday"
                                    tick={{ fontSize: 12 }}
                                    interval={0} // Show all weekdays on X-axis
                                />
                                <YAxis domain={[0, 'dataMax + 5']} /> {/* Dynamically adjust Y-axis */}
                                <Tooltip />
                                <Bar dataKey="prescriptions" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="calendar-container">
                        <h3>Calendar</h3>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                        />
                        <p>Selected date: {selectedDate.toDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
