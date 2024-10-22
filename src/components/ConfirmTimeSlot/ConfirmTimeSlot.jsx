import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  doc,
} from "firebase/firestore"; 
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
  const [doctorId, setDoctorId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [doctorName, setDoctorName] = useState("Doctor Name");
  const [specialization, setSpecialization] = useState("Specialization");
  const [doctorPhotoUrl, setDoctorPhotoUrl] = useState("path/to/placeholder-image.jpg");
  const timerRef = useRef(null);

  const generateAppointmentNumber = async (doctorId, scheduleId) => {
    try {
      const appointmentsRef = collection(db, 'Appointments');
      const q = query(appointmentsRef, where('scheduleId', '==', scheduleId));
      const querySnapshot = await getDocs(q);

      const existingNumbers = querySnapshot.docs.map((doc) => {
        const idParts = doc.data().appointmentNumber.split('-');
        const numPart = idParts[idParts.length - 1];
        return parseInt(numPart, 10);
      });

      let newNumber = 1;
      while (existingNumbers.includes(newNumber)) {
        newNumber++;
      }

      const appointmentNumber = `${doctorId}-${scheduleId}-${String(newNumber).padStart(3, '0')}`;
      return appointmentNumber;
    } catch (error) {
      console.error('Error generating appointment number: ', error);
      return null;
    }
  };

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
          setScheduleId(latestBooking.scheduleId);

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
        const doctorQuery = query(doctorsCollection, where("doctorName", "==", doctorName));
        const doctorSnapshot = await getDocs(doctorQuery);

        if (!doctorSnapshot.empty) {
          const doctorDoc = doctorSnapshot.docs[0];
          setDoctorId(doctorDoc.id);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storage = getStorage();
      const storageRef = ref(storage, `patient_photos/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData({ ...formData, photo: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentNumber = await generateAppointmentNumber(doctorId, scheduleId);
      if (!appointmentNumber) {
        throw new Error("Failed to generate appointment number.");
      }

      let photoUrl = formData.photo;

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
        doctorId,
        doctorName,
        appointmentNumber,
        visitingTime: appointmentDetails.visitingTime,
        appointmentDate: appointmentDetails.appointmentDate,
        createdAt: serverTimestamp(),
        photo: photoUrl,
        doctorPhotoUrl,
        specialization,
        scheduleId,
      });

      console.log("Appointment successfully saved");
      clearInterval(timerRef.current);
      navigate("/confirm");
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
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
          <p><strong>Doctor ID:</strong> {doctorId}</p>
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
          <input 
            type="text" 
            name="nic" 
            placeholder="NIC" 
            value={formData.nic} 
            onChange={handleChange} 
            required 
          />
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
            type="date" 
            name="dob" 
            placeholder="Date of Birth" 
            value={formData.dob} 
            onChange={handleChange} 
            required 
          />
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange} 
            required 
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-row">
          <textarea 
            name="allergies" 
            placeholder="Allergies" 
            value={formData.allergies} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-row">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
          />
        </div>
        <button type="submit">Confirm Appointment</button>
      </form>
    </div>
  );

  function formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
};

export default ConfirmSlot;
