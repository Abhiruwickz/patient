import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./doctorshedule.css";
import Footer from "../footer/footer";
import Header from "../header1/header1";

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scheduleData, setScheduleData] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [doctorPhotoUrl, setDoctorPhotoUrl] = useState("");  // State for doctor's photo URL

  const doctorId = location.state?.doctorId || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!doctorId) {
          console.error("No doctor ID provided, redirecting...");
          navigate('/doctor-grid');
          return;
        }

        // Fetch doctor details
        const doctorDocRef = doc(db, "Doctors", doctorId);
        const doctorSnap = await getDoc(doctorDocRef);

        if (!doctorSnap.exists()) {
          console.error("No doctor data found for doctorId:", doctorId);
          setDoctorName("Dr. Unknown");
          setDoctorSpecialization("Specialization Unknown");
          setDoctorStatus("inactive");
          setDoctorPhotoUrl("default_image_url");  // Set default image URL if doctor is not found
          setScheduleData([]);
          return;
        }

        const doctor = doctorSnap.data();
        setDoctorName(doctor.doctorName || "Dr. Unknown");
        setDoctorSpecialization(doctor.specialization || "Specialization Unknown");
        setDoctorStatus(doctor.status ? doctor.status.toLowerCase() : "inactive");
        setDoctorPhotoUrl(doctor.photo || "default_image_url");  // Set photo URL from Firestore or use default

        // Fetch schedule data
        const scheduleCollectionRef = collection(db, "schedule");
        const scheduleQuery = query(scheduleCollectionRef, where("doctor Id", "==", doctorId));
        const scheduleSnapshot = await getDocs(scheduleQuery);

        if (scheduleSnapshot.empty) {
          console.error("No schedule data found for doctorId:", doctorId);
          setScheduleData([]);
          return;
        }

        const schedule = scheduleSnapshot.docs.map(doc => doc.data());
        console.log("Fetched schedule data:", schedule); // Log fetched data

        const updatedSchedule = schedule.map(item => ({
          ...item,
          isFull: item.status === 'full',
          appointmentDate: item.appointmentDate || 'No Date',
          visitingTime: item.visitingTime || 'No Time',
          status: item.status || 'Unknown'
        }));

        setScheduleData(updatedSchedule);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [doctorId, navigate]);

  const handleBookNow = async (visitingTime, appointmentDate) => {
    try {
      // Save booking details to Firestore, including doctor image URL
      await addDoc(collection(db, "Bookings"), {
        doctorName: doctorName,
        doctorSpecialization: doctorSpecialization,
        appointmentDate: appointmentDate,
        visitingTime: visitingTime,
        doctorPhotoUrl: doctorPhotoUrl, // Save the doctor's photo URL
        createdAt: serverTimestamp() // Save the current timestamp
      });

      console.log("Booking saved successfully!");
      
      // Navigate to confirm time slot or another page after successful booking
      navigate('/confirm-time-slot', { state: { visitingTime, appointmentDate } });
    } catch (error) {
      console.error("Error saving booking details:", error);
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="doctor-card">
        <img
          className="doctor-img"
          src={doctorPhotoUrl}  // Use the state for doctor's photo URL
          alt={doctorName}
        />
        <div className="doctor-info">
          <h2>{doctorName}</h2>
          <p>{doctorSpecialization}</p>
          <h3>{doctorStatus}</h3>
        </div>
      </div>
      <div className="appointment-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.length > 0 ? (
              scheduleData.map((schedule, index) => (
                <tr key={index}>
                  <td>{schedule.appointmentDate}</td>
                  <td>{schedule.visitingTime}</td>
                  <td>
                    {doctorStatus === "active" && ( // Conditionally render the button based on doctor status
                      <button
                        className="book-button"
                        onClick={() => handleBookNow(schedule.visitingTime, schedule.appointmentDate)}
                      >
                        Book Now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No schedule data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorSchedule;
