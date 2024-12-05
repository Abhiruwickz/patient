import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  const [doctorName, setDoctorName] = useState("Doctor Name");
  const [specialization, setSpecialization] = useState("Specialization");
  const [doctorPhotoUrl, setDoctorPhotoUrl] = useState("path/to/placeholder-image.jpg");
  const timerRef = useRef(null);

  const generateAppointmentNumber = async (doctorId, scheduleId) => {
    try {
      const appointmentsRef = collection(db, "Appointments");
      const q = query(appointmentsRef, where("scheduleId", "==", scheduleId));
      const querySnapshot = await getDocs(q);

      const existingNumbers = querySnapshot.docs.map((doc) => {
        const idParts = doc.data().appointmentNumber.split("-");
        const numPart = idParts[idParts.length - 1];
        return parseInt(numPart, 10);
      });

      let newNumber = 1;
      while (existingNumbers.includes(newNumber)) {
        newNumber++;
      }

      const appointmentNumber = `${doctorId}-${scheduleId}-${String(newNumber).padStart(3, "0")}`;
      return appointmentNumber;
    } catch (error) {
      console.error("Error generating appointment number: ", error);
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

    const handleTimeout = () => {
      navigate("/doctors");
    };

    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleTimeout(); // calling handleTimeout here to navigate after time expires
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [navigate]); // eslint-disable-next-line react-hooks/exhaustive-deps

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

      // Save the appointment
      await setDoc(doc(db, "Appointments", appointmentNumber), {
        ...formData,
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
      alert("An error occurred while saving the appointment. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <Header />
      <h1 className="text-3xl font-semibold mb-6 mt-3 ">Confirm Time Slot</h1>

      <div className="flex mb-6 bg-white rounded-lg p-4 shadow-md">
  <img src={doctorPhotoUrl} alt="Doctor Profile" className="w-32 h-32 mr-4" />
  <div className="flex flex-col ml-10 ">
    <h2 className="text-xl font-semibold">{doctorName}</h2>
    <p className="text-blue-500">{specialization}</p>
    {/* <p className="text-sm text-gray-400">{appointmentDetails.visitingTime}</p> */}
  </div>
  {/* Right Side Section */}
  <div className="border-2 border-blue-800 bg-white rounded-lg w-1/3 p-4 shadow-md flex flex-col justify-center items-start ml-32">
    <p className="text-sm text-slate-700 font-semibold mb-2">{appointmentDetails.visitingTime}</p>
    <p className="text-sm text-red-300 font-bold">
      Complete within {Math.floor(timeRemaining / 60)} minutes your appointment.
    </p>
  </div>
</div>

<form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
        Patient Name
      </label>
      <input
        id="patientName"
        type="text"
        name="patientName"
        placeholder="Enter full name"
        value={formData.patientName}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      />
    </div>
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        type="email"
        name="email"
        placeholder="example@example.com"
        value={formData.email}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
        Phone
      </label>
      <input
        id="phone"
        type="text"
        name="phone"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      />
    </div>
    <div>
      <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
        Blood Group
      </label>
      <input
        id="bloodGroup"
        type="text"
        name="bloodGroup"
        placeholder="e.g., O+"
        value={formData.bloodGroup}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
        NIC
      </label>
      <input
        id="nic"
        type="text"
        name="nic"
        placeholder="Enter NIC"
        value={formData.nic}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      />
    </div>
    <div>
      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
        Gender
      </label>
      <select
        id="gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      >
        <option value="" disabled>
          Select Gender
        </option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div>
      <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
        Date of Birth
      </label>
      <input
        id="dob"
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleChange}
        className="p-2 border rounded-md w-full"
        required
      />
    </div>
    <div>
      <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
        Upload Photo
      </label>
      <input
        id="photo"
        type="file"
        onChange={handlePhotoUpload}
        className="p-2 border rounded-md w-full"
      />
    </div>
  </div>

  <div>
    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
      Address
    </label>
    <textarea
      id="address"
      name="address"
      placeholder="Enter your address"
      value={formData.address}
      onChange={handleChange}
      className="p-2 border rounded-md w-full"
      rows="2"
      required
    />
  </div>

  <div>
    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
      Allergies (if any)
    </label>
    <textarea
      id="allergies"
      name="allergies"
      placeholder="List any allergies"
      value={formData.allergies}
      onChange={handleChange}
      className="p-2 border rounded-md w-full"
      rows="4"
    />
  </div>

        <div className="flex justify-between mb-4">
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-md"
            >
              Go back
            </button>
          </div>
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-md"
            >
              Confirm Appointment
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ConfirmSlot;