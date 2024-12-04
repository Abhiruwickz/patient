import React, { useEffect, useState } from 'react';
import { FaUser, FaPrescriptionBottle } from 'react-icons/fa';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Ensure correct path to firebase config
import Calendar from 'react-calendar'; // Import react-calendar
import '../components/Dashboard_pharmacy.css'; // Import custom CSS for the dashboard
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components

// Mock decrypt function; replace this with your actual decryption logic
const decryptDate = (encryptedDate) => {
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
        <div className="flex flex-col p-8 bg-white">
            <div className="flex justify-between mb-6 mt-4">
                <div className='flex flex-row items-center gap-16 p-6 w-full justify-center'>
                <div className="flex items-center bg-blue-200 rounded-xl p-6 shadow-lg hover:transform hover:translate-y-1 transition-transform duration-200 w-1/3">
                    <FaUser size={50} className="text-yellow-500" />
                    
                    <div className="ml-4 text-right">
                        <div className="text-3xl font-bold">{patientCount}</div>
                        <div className="text-lg text-gray-700">Patients</div>
                    </div>
                </div>
                <div className="flex items-center bg-blue-200 rounded-xl p-6 shadow-lg hover:transform hover:translate-y-1 transition-transform duration-200 w-1/3">
                    <FaPrescriptionBottle size={50} className="text-yellow-500" />
                    <div className="ml-4 ">
                        <div className="text-3xl font-bold">{prescriptionCount}</div>
                        <div className="text-lg text-gray-700">Prescriptions</div>
                    </div>
                </div>
                </div>
            </div>
 
            <div className="flex flex-wrap justify-between w-full mt-14">
                <div className="bg-white rounded-lg p-6 mb-6 w-full lg:w-2/3">
                    <h3 className="mb-4 text-xl font-semibold text-gray-700">Weekly Progress</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="weekday" />
                            <YAxis domain={[0, Math.max(maxCount + 5, 50)]} />
                            <Tooltip />
                            <Bar dataKey="prescriptions" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6 w-full lg:w-1/3 shadow-lg">
                    <h3 className="mb-4 text-xl font-semibold text-black text-center">Calendar</h3>
                    <div className="flex justify-center">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            className="react-calendar bg-white border border-gray-300 rounded-lg shadow-md w-full"
                        />
                    </div>
                    <p className="mt-4 text-black text-center">
                        Selected date: <span className="font-medium">{selectedDate.toDateString()}</span>
                    </p>
                </div>


            </div>
        </div>
    );
};

export default Dashboard;
