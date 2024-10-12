import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, setDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy, limit, where } from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig";
import './ConfirmTimeSlot.css';
import Header from "../header1/header1";

const ConfirmSlot = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    gender: "",
    nic: "",
    address: "",
    dob: "",
    allergies: "",
    photo: null,
  });

  const [appointmentDetails, setAppointmentDetails] = useState({
    visitingTime: "",
    appointmentDate: "",
  });

  const [timeRemaining, setTimeRemaining] = useState(900);
  const [doctorId, setDoctorId] = useState(""); // Add state to store doctor ID
  const navigate = useNavigate();
  const location = useLocation();

  const [doctorName, setDoctorName] = useState("Doctor Name");
  const [specialization, setSpecialization] = useState("Specialization");
  const [doctorPhotoUrl, setDoctorPhotoUrl] = useState("path/to/placeholder-image.jpg");
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchLatestBooking = async () => {
      try {
        const bookingsCollection = collection(db, "Bookings");
        const bookingQuery = query(bookingsCollection, orderBy("createdAt", "desc"), limit(1));
        const bookingSnapshot = await getDocs(bookingQuery);

        if (!bookingSnapshot.empty) {
          const latestBooking = bookingSnapshot.docs[0].data();
          setDoctorName(latestBooking.doctorName);
          setSpecialization(latestBooking.doctorSpecialization);
          setAppointmentDetails({
            visitingTime: latestBooking.visitingTime,
            appointmentDate: latestBooking.appointmentDate,
          });
          setDoctorPhotoUrl(latestBooking.doctorPhotoUrl || "path/to/placeholder-image.jpg");

          // Fetch the doctor ID based on the doctor name
          fetchDoctorId(latestBooking.doctorName);
        } else {
          console.log("No bookings found");
        }
      } catch (error) {
        console.error("Error fetching latest booking:", error);
      }
    };

    const fetchDoctorId = async (doctorName) => {
      try {
        const doctorsCollection = collection(db, "Doctors");
        const doctorQuery = query(doctorsCollection, where("doctorName", "==", doctorName)); // Query for doctorName
        const doctorSnapshot = await getDocs(doctorQuery);

        if (!doctorSnapshot.empty) {
          const doctorDoc = doctorSnapshot.docs[0]; // Assuming the first match is the desired doctor
          setDoctorId(doctorDoc.id); // Set the doctor ID from Firestore document ID
        } else {
          console.log("Doctor not found");
        }
      } catch (error) {
        console.error("Error fetching doctor ID:", error);
      }
    };

    fetchLatestBooking();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          navigate("/doctors");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Helper function to generate the appointment number for each doctor, which resets daily
  const generateAppointmentNumber = async (doctorId) => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const counterDocRef = doc(db, "doctorCounters", doctorId);
    const counterSnapshot = await getDoc(counterDocRef);

    let counter = 1; // Default to 1 if no appointments for today

    if (counterSnapshot.exists()) {
      const counterData = counterSnapshot.data();
      const lastUpdated = counterData.lastUpdated || "";
      
      // Check if the counter needs to reset (new day)
      if (lastUpdated === today) {
        counter = counterData.counter + 1; // Increment if the same day
      }
    }

    // Update or set the counter in Firestore
    await setDoc(counterDocRef, {
      counter,
      lastUpdated: today
    });

    // Format appointment number as "DOC<doctorID>-DATE-<counter>"
    const appointmentNumber = `DOC${doctorId}-${today}-${String(counter).padStart(4, '0')}`;

    return appointmentNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate appointment number per doctor and per day
      const appointmentNumber = await generateAppointmentNumber(doctorId);

      let photoUrl = null;

      if (formData.photo) {
        const storage = getStorage();
        const storageRef = ref(storage, `appointments/${appointmentNumber}/${formData.photo.name}`);

        await uploadBytes(storageRef, formData.photo);
        photoUrl = await getDownloadURL(storageRef);
      }

      // Save appointment details along with doctor info in Appointments collection using appointmentNumber as document ID
      await setDoc(doc(db, "Appointments", appointmentNumber), {
        patientName: formData.patientName,
        email: formData.email,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        nic: formData.nic,
        address: formData.address,
        dob: formData.dob,
        allergies: formData.allergies,
        appointmentNumber,
        doctorId,
        doctorName,               // Include doctor's name
        doctorSpecialization: specialization, // Include doctor's specialization
        doctorPhotoUrl,           // Include doctor's photo URL
        appointmentDate: appointmentDetails.appointmentDate, // Include appointment date
        visitingTime: appointmentDetails.visitingTime, // Include visiting time
        createdAt: serverTimestamp(),
        photoUrl                  // Include photo URL if uploaded
      });

      console.log("Appointment saved:", { ...formData, appointmentNumber });

      clearInterval(timerRef.current); // Clear the timer
      // Navigate to confirm page
      navigate("/confirm"); // Navigate to the confirm page after saving
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
  };

  const formatTimeRemaining = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="confirm-slot-container">
      <Header />
      <h1>Confirm Time Slot</h1>

      <div className="doctor-info-card">
        <img src={doctorPhotoUrl} alt="Doctor Profile" />
        <div className="doctor-details">
          <h2>{doctorName}</h2>
          <p>{specialization}</p>
          <p><strong>Doctor ID:</strong> {doctorId}</p> {/* Display doctor ID */}
        </div>
        <div className="appointment-details">
          <div className="time-slot">
            <p>{appointmentDetails.visitingTime || "Loading time..."}</p>
            <p>{appointmentDetails.appointmentDate || "Loading date..."}</p>
          </div>
          <div className="time-warning">
            <p>Complete within <span>{formatTimeRemaining(timeRemaining)}</span></p>
          </div>
        </div>
      </div>

      <form className="patient-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input 
            type="text" 
            name="patientName" 
            placeholder="Patient Name" 
            value={formData.patientName} 
            onChange={handleChange} 
            required
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-row">
          <input 
            type="text" 
            name="phone" 
            placeholder="Phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required
          />
          <input 
            type="text" 
            name="bloodGroup" 
            placeholder="Blood Group" 
            value={formData.bloodGroup} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-row">
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input 
            type="text" 
            name="nic" 
            placeholder="NIC" 
            value={formData.nic} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-row">
          <input 
            type="text" 
            name="address" 
            placeholder="Address" 
            value={formData.address} 
            onChange={handleChange} 
            required
          />
          <input 
            type="date" 
            name="dob" 
            placeholder="Date of Birth" 
            value={formData.dob} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-row">
          <input 
            type="text" 
            name="allergies" 
            placeholder="Allergies" 
            value={formData.allergies} 
            onChange={handleChange} 
          />
          <input 
            type="file" 
            name="photo" 
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="confirm-button">CONFIRM</button>
      </form>
    </div>
  );
};

export default ConfirmSlot;
