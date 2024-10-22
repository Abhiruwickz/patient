import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./doctorshedule.css";  // Updated CSS import
import Footer from "../footer/footer";
import Header from "../header1/header1";

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scheduleData, setScheduleData] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [doctorPhotoUrl, setDoctorPhotoUrl] = useState("");

  // Get the doctorId from the location state
  const doctorId = location.state?.doctorId || ''; // Default to empty string if not found

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
          setDoctorPhotoUrl("default_image_url");
          setScheduleData([]);
          return;
        }

        const doctor = doctorSnap.data();
        setDoctorName(doctor.doctorName || "Dr. Unknown");
        setDoctorSpecialization(doctor.specialization || "Specialization Unknown");
        setDoctorStatus(doctor.status ? doctor.status.toLowerCase() : "inactive");
        setDoctorPhotoUrl(doctor.photo || "default_image_url");

        // Fetch schedule data using the correct path
        const scheduleCollectionRef = collection(db, `schedule/${doctorId}/schedules`);
        const scheduleSnapshot = await getDocs(scheduleCollectionRef);

        if (scheduleSnapshot.empty) {
          console.error("No schedule data found for doctorId:", doctorId);
          setScheduleData([]);
          return;
        }

        const updatedSchedule = scheduleSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id, // Add the schedule ID here
          isFull: doc.data().status === 'full',
          appointmentDate: doc.data().appointmentDate || 'No Date',
          visitingTime: doc.data().visitingTime || 'No Time',
          status: doc.data().status || 'Unknown'
        }));

        setScheduleData(updatedSchedule);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [doctorId, navigate]);

  const handleBookNow = async (visitingTime, appointmentDate, scheduleId) => {
    try {
      await addDoc(collection(db, "Bookings"), {
        doctorName: doctorName,
        doctorSpecialization: doctorSpecialization,
        appointmentDate: appointmentDate,
        visitingTime: visitingTime,
        doctorPhotoUrl: doctorPhotoUrl,
        scheduleId: scheduleId, // Pass scheduleId here
        createdAt: serverTimestamp()
      });

      console.log("Booking saved successfully!");
      navigate('/confirm-time-slot', { state: { visitingTime, appointmentDate, scheduleId } });
    } catch (error) {
      console.error("Error saving booking details:", error);
    }
  };

  return (
    <div className="doctor-schedule-container">
      <Header />
      <div className="doctor-schedule-card">
        <div className="doctor-schedule-info">
          <h2>{doctorName}</h2>
          <div className="doctor-schedule-separator-line"></div>
          <p>{doctorSpecialization}</p>
          <h3 className="doctor-schedule-h3">{doctorStatus}</h3>
        </div>
      </div>
      <img
        className="doctor-schedule-img"
        src={doctorPhotoUrl}
        alt={doctorName}
      />
      <div className="doctor-schedule-appointment-table">
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
                    {doctorStatus === "available" && (
                      <button
                        className="doctor-schedule-book-button"
                        onClick={() => handleBookNow(schedule.visitingTime, schedule.appointmentDate, schedule.id)} // Pass schedule ID here
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
