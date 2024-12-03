import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
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

  const doctorId = location.state?.doctorId || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!doctorId) {
          console.error("No doctor ID provided, redirecting...");
          navigate("/doctor-grid");
          return;
        }

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

        const scheduleCollectionRef = collection(db, `schedule/${doctorId}/schedules`);
        const scheduleSnapshot = await getDocs(scheduleCollectionRef);

        if (scheduleSnapshot.empty) {
          console.error("No schedule data found for doctorId:", doctorId);
          setScheduleData([]);
          return;
        }

        const updatedSchedule = scheduleSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          isFull: doc.data().status === "full",
          appointmentDate: doc.data().appointmentDate || "No Date",
          visitingTime: doc.data().visitingTime || "No Time",
          status: doc.data().status || "Unknown",
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
        scheduleId: scheduleId,
        createdAt: serverTimestamp(),
      });

      console.log("Booking saved successfully!");
      navigate("/confirm-time-slot", { state: { visitingTime, appointmentDate, scheduleId } });
    } catch (error) {
      console.error("Error saving booking details:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center px-4 py-8">
        {/* Doctor Info */}
        <div className="flex w-full max-w-5xl bg-white shadow-lg rounded-lg p-6 items-center">
          <img
            className="w-48 h-48 rounded-lg object-cover mr-10"
            src={doctorPhotoUrl}
            alt={doctorName}
          />
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-800">{doctorName}</h2>
            <p className="text-gray-600 text-lg">{doctorSpecialization}</p>
            <span
              className={`text-sm font-medium mt-2 ${
                doctorStatus === "available" ? "text-green-500" : "text-red-500"
              }`}
            >
              {doctorStatus === "available" ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      </div>
      {/* Schedule Table */}
      <div className="mt-8 px-4 w-full max-w-5xl mx-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 text-sm">
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Time</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {scheduleData.length > 0 ? (
              scheduleData.map((schedule, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4">{schedule.appointmentDate}</td>
                  <td className="py-3 px-4">{schedule.visitingTime}</td>
                  <td className="py-3 px-4 text-center">
                    {schedule.isFull ? (
                      <span className="text-red-500 font-semibold">Unavailable</span>
                    ) : (
                      <span className="text-green-500 font-semibold">Available</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {schedule.isFull ? (
                      <span className="text-gray-400">Session is full</span>
                    ) : (
                      <button
                        className="bg-blue-500 text-white py-1 px-4 rounded-full hover:bg-blue-600"
                        onClick={() =>
                          handleBookNow(
                            schedule.visitingTime,
                            schedule.appointmentDate,
                            schedule.id
                          )
                        }
                      >
                        Book Now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No schedule data available
                </td>
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
