import React, { useEffect, useState } from 'react';
import { FaUser, FaPrescriptionBottle } from 'react-icons/fa';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Ensure correct path to firebase config
import './Dashboard_pharmacy.css'; // Ensure this CSS file is correctly imported
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components
import Calendar from 'react-calendar'; // Import react-calendar
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

// Mock decrypt function; replace this with your actual decryption logic
const decryptDate = (encryptedDate) => {
    // Example: Assuming the encryptedDate is a string and you decrypt it to a timestamp.
    // Replace this logic with the actual decryption method.
    return new Date(atob(encryptedDate));  // Base64 decoding as an example
};

const Dashboard = () => {
    const [patientCount, setPatientCount] = useState(0);
    const [prescriptionCount, setPrescriptionCount] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // For calendar date selection

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const appointmentsCollection = collection(db, 'Appointments');
                const appointmentsSnapshot = await getDocs(appointmentsCollection);
                setPatientCount(appointmentsSnapshot.docs.length);

                const prescriptionsCollection = collection(db, 'prescriptions');
                const prescriptionsSnapshot = await getDocs(prescriptionsCollection);
                setPrescriptionCount(prescriptionsSnapshot.size);

                const prescriptionsByDay = {
                    Monday: 5,
                    Tuesday: 9,
                    Wednesday: 2,
                    Thursday: 0,
                    Friday: 0,
                    Saturday: 0,
                    Sunday: 0,
                };

                prescriptionsSnapshot.docs.forEach(prescription => {
                    const prescriptionData = prescription.data();
                    console.log("Prescription data:", prescriptionData); // Log prescription data for debugging

                    const encryptedTimestamp = prescriptionData.prescriptionDate;
                    if (!encryptedTimestamp) {
                        console.error("Invalid or missing prescriptionDate format:", encryptedTimestamp);
                        return;
                    }

                    // Decrypt the prescriptionDate
                    const decryptedDate = decryptDate(encryptedTimestamp);
                    if (!(decryptedDate instanceof Date) || isNaN(decryptedDate)) {
                        console.error("Failed to decrypt or convert prescriptionDate:", decryptedDate);
                        return;
                    }

                    const weekday = getWeekdayName(decryptedDate);
                    console.log("Decrypted Prescription Date:", decryptedDate, "Weekday:", weekday); // Log date and weekday for each prescription

                    if (prescriptionsByDay[weekday] !== undefined) {
                        prescriptionsByDay[weekday] += 1;
                    }
                });

                // Format data for the chart
                const formattedChartData = Object.keys(prescriptionsByDay).map(weekday => ({
                    weekday,
                    prescriptions: prescriptionsByDay[weekday],
                }));

                console.log("Formatted Chart Data:", formattedChartData); // Log final chart data

                setChartData(formattedChartData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchCounts(); // Call the fetchCounts function to get the data

    }, []);

    const getWeekdayName = (date) => {
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date); // Get full weekday name (e.g., "Monday")
    };

    const maxCount = Math.max(...chartData.map(data => data.prescriptions), 0); // Calculate the max count

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
                        <ResponsiveContainer width="200%" height={300}>
                            <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="weekday" />
                                <YAxis domain={[0, Math.max(maxCount + 5, 50)]} /> {/* Adjusted Y-axis dynamically */}
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
