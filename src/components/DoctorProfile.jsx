import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebaseConfig'; 
import { useLocation, useNavigate } from 'react-router-dom';
import './DoctorProfile.css';

const DoctorProfile = () => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate(); // Initialize navigate for routing
    const { doctorId } = location.state || {}; 

    useEffect(() => {
        console.log("Doctor ID:", doctorId); // Debugging line

        if (!doctorId) {
            console.error("No doctor ID found in location state.");
            setLoading(false);
            return; // Exit the effect early if doctorId is not defined
        }

        const fetchDoctorData = async () => {
            try {
                const doctorRef = doc(db, "Doctors", doctorId);
                const docSnap = await getDoc(doctorRef);
                
                if (docSnap.exists()) {
                    setDoctor(docSnap.data());
                    console.log("Doctor data fetched:", docSnap.data());
                } else {
                    console.warn("No such document! Check Firestore for doctorId:", doctorId);
                }
            } catch (error) {
                console.error("Error fetching doctor data: ", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, [doctorId]);

    // Check loading state or if doctor is null
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!doctor) {
        return <div>No doctor data available</div>;
    }

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleSave = async () => {
        try {
            // Update Firestore with new doctor data
            const doctorRef = doc(db, "Doctors", doctorId);
            await updateDoc(doctorRef, doctor); // Update doctor data in Firestore
            setShowPopup(true); // Show popup after saving
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
        } catch (error) {
            console.error("Error updating doctor data: ", error.message);
        } finally {
            setIsEditable(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor((prevDoctor) => ({ ...prevDoctor, [name]: value })); // Update the doctor state
    };

    const handleLogout = () => {
        // Clear any authentication state if needed (this depends on your auth setup)
        // For example: auth.signOut(); // Uncomment if using Firebase Auth

        // Navigate to the login page
        navigate('/login');
    };

    return (
        <div className="doctor-profile">
            <div className="doctor-header">
                <img
                    src={doctor.photo || '/default-profile.png'} // Use 'photo' field
                    alt={`${doctor.doctorName}'s profile`}
                    className="doctor-img"
                />
                <h1 className="doctor-name">{doctor.doctorName}</h1>
                <p className="doctor-biography">{doctor.biography}</p>
            </div>

            <div className="doctor-details">
                <h2 className="doctor-details-title">Details</h2>
                <p className="doctor-specialization">
                    <strong>Specialization:</strong> 
                    {isEditable ? (
                        <input 
                            type="text" 
                            name="specialization" 
                            value={doctor.specialization} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.specialization
                    )}
                </p>
                <p className="doctor-contact">
                    <strong>Contact:</strong> 
                    {isEditable ? (
                        <input 
                            type="text" 
                            name="phoneNumber" 
                            value={doctor.phoneNumber} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.phoneNumber
                    )}
                </p>
                <p className="doctor-email">
                    <strong>Email:</strong> 
                    {isEditable ? (
                        <input 
                            type="email" 
                            name="email" 
                            value={doctor.email} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.email
                    )}
                </p>
                <p className="doctor-hospital">
                    <strong>Hospital:</strong> 
                    {isEditable ? (
                        <input 
                            type="text" 
                            name="hospital" 
                            value={doctor.hospital} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.hospital
                    )}
                </p>
                <p className="doctor-dob">
                    <strong>Date of Birth:</strong> 
                    {isEditable ? (
                        <input 
                            type="date" 
                            name="dob" 
                            value={doctor.dob} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.dob
                    )}
                </p>
                <p className="doctor-nic">
                    <strong>NIC:</strong> 
                    {isEditable ? (
                        <input 
                            type="text" 
                            name="nic" 
                            value={doctor.nic} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.nic
                    )}
                </p>
                <p className="doctor-status">
                    <strong>Status:</strong> 
                    {isEditable ? (
                        <input 
                            type="text" 
                            name="status" 
                            value={doctor.status} 
                            onChange={handleChange}
                        />
                    ) : (
                        doctor.status
                    )}
                </p>
            </div>

            <div className="user-profile-buttons">
                {!isEditable ? (
                    <button className="user-profile-edit-button" onClick={handleEdit}>
                        Edit
                    </button>
                ) : (
                    <button className="user-profile-save-button" onClick={handleSave}>
                        Save
                    </button>
                )}
                <button className="user-profile-logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Popup for showing success message */}
            {showPopup && (
                <div className="popup-message">
                    Profile updated successfully!
                </div>
            )}
        </div>
    );
};

export default DoctorProfile;
