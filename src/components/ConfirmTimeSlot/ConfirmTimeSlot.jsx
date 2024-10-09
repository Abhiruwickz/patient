import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy, limit, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase storage methods
import { db } from "../../firebaseConfig"; // Import Firestore configurations
import './ConfirmTimeSlot.css';
import Header from "../header1/header1";

const ConfirmSlot = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    contactNo: "",
    bloodGroup: "",
    gender: "",
    nic: "",
    address: "",
    dob: "",
    allergies: "",
    photo: null, // Handle photo uploads
  });

  const [appointmentDetails, setAppointmentDetails] = useState({
    visitingTime: "",
    appointmentDate: "",
  });

  const [counter, setCounter] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
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
        } else {
          console.log("No bookings found");
        }
      } catch (error) {
        console.error("Error fetching latest booking:", error);
      }
    };

    const fetchCounter = async () => {
      try {
        const counterDocRef = doc(db, "counters", "appointmentCounter");
        const counterSnapshot = await getDoc(counterDocRef);

        if (counterSnapshot.exists()) {
          const counterData = counterSnapshot.data();
          setCounter(counterData.currentCount || 0);
        } else {
          await setDoc(counterDocRef, { currentCount: 0 });
          setCounter(0);
        }
      } catch (error) {
        console.error("Error fetching counter:", error);
      }
    };

    fetchLatestBooking();
    fetchCounter();

    // Start the countdown timer
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
      setFormData({ ...formData, photo: files[0] }); // Store file for upload
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const newCounter = counter + 1;
      const counterDocRef = doc(db, "counters", "appointmentCounter");
  
      // Update appointment counter
      await updateDoc(counterDocRef, { currentCount: newCounter });
  
      const appointmentNumber = `APPT${newCounter.toString().padStart(4, '0')}`;
  
      let photoUrl = null;
  
      // Check if a photo is uploaded
      if (formData.photo) {
        const storage = getStorage();
        const storageRef = ref(storage, `appointments/${appointmentNumber}/${formData.photo.name}`);
  
        // Upload the photo to Firebase Storage
        await uploadBytes(storageRef, formData.photo);
        photoUrl = await getDownloadURL(storageRef); // Get the download URL after uploading
      }
  
      // Save appointment details along with doctor info in Appointments collection, excluding 'photo'
      await addDoc(collection(db, "Appointments"), { 
        patientName: formData.patientName,
        email: formData.email,
        contactNo: formData.contactNo,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        nic: formData.nic,
        address: formData.address,
        dob: formData.dob,
        allergies: formData.allergies,
        appointmentNumber,
        doctorName,               // Include doctor's name
        doctorSpecialization: specialization, // Include doctor's specialization
        doctorPhotoUrl,           // Include doctor's photo URL
        appointmentDate: appointmentDetails.appointmentDate, // Include appointment date
        visitingTime: appointmentDetails.visitingTime, // Include visiting time
        createdAt: serverTimestamp(),
        photoUrl:formData.photo // Timestamp of when the appointment was created
        
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
            name="contactNo" 
            placeholder="Contact No" 
            value={formData.contactNo} 
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
            name="address" 
            placeholder="Address" 
            value={formData.address} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-row">
          <input 
            type="text" 
            name="nic" 
            placeholder="NIC" 
            value={formData.nic} 
            onChange={handleChange} 
            required
          />
          <input 
            type="date" 
            name="dob" 
            value={formData.dob} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-row">
          <input 
            type="image" 
            name="photo" 
            value={formData.photo}
            onChange={handleChange} 
          />
          <input 
            type="text" 
            name="allergies" 
            placeholder="Allergies or Other" 
            value={formData.allergies} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="go-back-button" onClick={() => navigate(-1)}>Go back</button>
          <button type="submit" className="confirm-button">Confirm Appointment</button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmSlot;
