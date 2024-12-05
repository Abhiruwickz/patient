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
  getCountFromServer,
} from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig";
import './ConfirmTimeSlot.css';
import Header from "../header1/header1";
import { getDoc } from "firebase/firestore";
import Navbar from '../home/navbar/navbar';

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


     // Function to generate the reference number based on existing patients
     const generateReferenceNo = async () => {
      try {
        // Get the count of all documents in the "Patients" collection
        const patientsCollection = collection(db, 'Patients');
        const snapshot = await getCountFromServer(patientsCollection);
    
        const totalPatients = snapshot.data().count; // Total existing patients
        const referenceNo = `REF-2024-${totalPatients + 1}`; // Generate new reference number
    
        return referenceNo;
      } catch (error) {
        console.error('Error generating reference number:', error);
        return '';
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // Validate NIC format
      const nicRegex = /^(?:\d{9}[VX]|\d{12})$/; // 10 digits with 'V' or 'X' or 12 digits
      if (!nicRegex.test(formData.nic)) {
        alert("Invalid NIC. Please enter a valid NIC number.");
        return;
      }
    
      // Validate phone number format (Sri Lankan phone number format)
      const phoneRegex = /^(\+94|0)?7[0-9]{8}$/; // Validates Sri Lankan phone numbers
      if (!phoneRegex.test(formData.phone)) {
        alert("Invalid phone number. Please enter a valid phone number.");
        return;
      }
    
      // Validate Date of Birth (DOB) - Ensure the date is in the correct format (YYYY-MM-DD)
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/; // Checks if DOB is in YYYY-MM-DD format
      if (!dobRegex.test(formData.dob)) {
        alert("Invalid Date of Birth. Please enter a valid DOB in the format YYYY-MM-DD.");
        return;
      }
    
      // Check if the age is above 18 years
      const birthDate = new Date(formData.dob);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDifference = currentDate.getMonth() - birthDate.getMonth();
      const dayDifference = currentDate.getDate() - birthDate.getDate();
    
      // Adjust age if the birthday hasn't occurred yet this year
      if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
      }
    
      if (age < 18) {
        alert("You must be at least 18 years old to complete the appointment.");
        return;
      }
    
      try {
        // Generate appointment number
        const appointmentNumber = await generateAppointmentNumber(doctorId, scheduleId);
        if (!appointmentNumber) {
          throw new Error("Failed to generate appointment number.");
        }
    
        // Generate reference number for the patient
        const refNo = await generateReferenceNo();
    
        let photoUrl = formData.photo;
    
        // Retrieve the relevant schedule
        const scheduleDocRef = doc(db, "schedule", doctorId, "schedules", scheduleId);
        const scheduleDoc = await getDoc(scheduleDocRef);
    
        if (!scheduleDoc.exists()) {
          alert("Schedule not found. Please try again.");
          return;
        }
    
        const scheduleData = scheduleDoc.data();
    
        // Check if the schedule is almost fully booked
        const [startHour, startMinutes, startPeriod] = parseTime(scheduleData.startTime);
        const [endHour, endMinutes, endPeriod] = parseTime(scheduleData.endTime);
    
        if (
          convertTo24HourFormat(startHour, startMinutes, startPeriod) >=
          convertTo24HourFormat(endHour, endMinutes, endPeriod)
        ) {
          alert("Sorry, cannot complete your appointment because this schedule is almost fully booked.");
          return;
        }
    
        // Increment startTime by 6 minutes
        const updatedStartTime = addMinutesToTime(startHour, startMinutes, startPeriod, 6);
    
        // Update the schedule's startTime
        await setDoc(
          scheduleDocRef,
          { startTime: updatedStartTime },
          { merge: true }
        );
    
        // Save the patient details
        const patientData = {
          referenceNo: refNo,
          name: formData.patientName,
          phone: formData.phone,
          gender: formData.gender,
          nic: formData.nic,
          email: formData.email,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          dob: formData.dob,
          allergies: formData.allergies || "Appointed Patient", // Add default value if allergies is not provided
        };
    
        await setDoc(doc(db, "Patients", refNo), patientData);
    
        // Save the appointment details
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
          appointmentTime: updatedStartTime,
        });
    
        console.log("Appointment and patient successfully saved");
    
        // Clear form data
        setFormData({
          patientName: "",
          email: "",
          phone: "",
          bloodGroup: "",
          gender: "",
          nic: "",
          address: "",
          dob: "",
          allergies: "",
          photo: "",
        });
    
        clearInterval(timerRef.current);
        navigate("/confirm");
      } catch (error) {
        console.error("Error saving appointment or patient:", error);
        alert("An error occurred while saving the appointment. Please try again.");
      }
    };
    
    

    // Helper functions
    const parseTime = (timeString) => {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      return [hours, minutes, period];
    };
    
    const convertTo24HourFormat = (hours, minutes, period) => {
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    
    const addMinutesToTime = (hours, minutes, period, increment) => {
      let totalMinutes = convertTo24HourFormat(hours, minutes, period) + increment;
    
      // Adjust for 24-hour clock
      if (totalMinutes >= 1440) totalMinutes -= 1440;
    
      const updatedHours = Math.floor(totalMinutes / 60) % 24;
      const updatedMinutes = totalMinutes % 60;
      const updatedPeriod = updatedHours >= 12 ? 'PM' : 'AM';
    
      const finalHours = updatedHours % 12 || 12;
      return `${String(finalHours).padStart(2, '0')}:${String(updatedMinutes).padStart(2, '0')} ${updatedPeriod}`;
    };
    
  

  return (
    <div className=" flex flex-col items-center bg-slate-200 min-h-screen p-6">
    <Navbar />
    <h1 className="text-3xl font-extrabold text-blue-700 mb-8">Confirm Time Slot</h1>
  
    <div className=" flex flex-col md:flex-row items-center bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mb-10">
      <img
        src={doctorPhotoUrl}
        alt="Doctor Profile"
        className="w-28 h-28 rounded-full object-cover"
      />
      <div className="flex flex-col items-start w-full md:w-1/2 mt-6 md:mt-0 ml-6">
        <h2 className="text-xl font-semibold text-gray-700 ">{doctorName}</h2>
        <p className="text-gray-500">{specialization}</p>
        <p className="text-gray-500">
          <strong>Doctor ID:</strong> {doctorId}
        </p>
      </div>
     
     <div className="flex flex-col items-end w-full md:w-1/2 mt-6 md:mt-0 md:pl-4 ">
    <p className="text-lg font-medium text-blue-600">
      {appointmentDetails.visitingTime || "Loading time..."}
    </p>
    <p>{appointmentDetails.appointmentDate || "Loading date..."}</p>
    <div className="time-warning text-red-600 font-semibold mt-4">
      Complete within{" "}
      <span className="text-lg">{formatTimeRemaining(timeRemaining)}</span>
    </div>

</div>

    </div>
  
    <form
      className="patient-form bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="patientName"
            className="block text-sm font-medium text-gray-700"
          >
            Patient Name
          </label>
          <input
            id="patientName"
            type="text"
            name="patientName"
            placeholder="Enter patient name"
            value={formData.patientName}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            id="phone"
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label
            htmlFor="bloodGroup"
            className="block text-sm font-medium text-gray-700"
          >
            Blood Group
          </label>
          <input
            id="bloodGroup"
            type="text"
            name="bloodGroup"
            placeholder="Enter blood group"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="nic"
            className="block text-sm font-medium text-gray-700"
          >
            NIC
          </label>
          <input
            id="nic"
            type="text"
            name="nic"
            placeholder="Enter NIC"
            value={formData.nic}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="dob"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="allergies"
          className="block text-sm font-medium text-gray-700"
        >
          Allergies (if any)
        </label>
        <textarea
          id="allergies"
          name="allergies"
          placeholder="List any allergies"
          value={formData.allergies}
          onChange={handleChange}
          className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
          rows="4"
        />
      </div>
      <div>
        <label
          htmlFor="photoUpload"
          className="block text-sm font-medium text-gray-700"
        >
          Upload Photo
        </label>
        <input
          id="photoUpload"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 focus:ring focus:ring-blue-300"
      >
        Confirm Appointment
      </button>
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
