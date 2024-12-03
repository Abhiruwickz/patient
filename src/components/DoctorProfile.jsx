import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { useLocation, useNavigate } from 'react-router-dom';

const DoctorProfile = () => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { doctorId } = location.state || {};

    useEffect(() => {
        if (!doctorId) {
            setLoading(false);
            return;
        }

        const fetchDoctorData = async () => {
            try {
                const doctorRef = doc(db, "Doctors", doctorId);
                const docSnap = await getDoc(doctorRef);

                if (docSnap.exists()) {
                    setDoctor(docSnap.data());
                } else {
                    console.warn("No such document!");
                }
            } catch (error) {
                console.error("Error fetching doctor data: ", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, [doctorId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!doctor) {
        return <div className="flex justify-center items-center h-screen">No doctor data available</div>;
    }

    const handleEdit = () => setIsEditable(true);

    const handleSave = async () => {
        try {
            const doctorRef = doc(db, "Doctors", doctorId);
            await updateDoc(doctorRef, doctor);
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
        } catch (error) {
            console.error("Error updating doctor data: ", error.message);
        } finally {
            setIsEditable(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogout = () => navigate('/login');

    return (
        <div className="min-h-screen flex flex-col items-center py-10">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-8">
                {/* Doctor Profile */}
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={doctor.photo || '/default-profile.png'}
                        alt={`${doctor.doctorName}'s profile`}
                        className="w-32 h-32 rounded-full object-cover shadow-md mb-4 border-4 border-blue-500"
                    />
                    <h1 className="text-2xl font-bold text-gray-800">{doctor.doctorName}</h1>
                    <p className="text-sm text-gray-600 text-center px-4 mt-2">
                        {doctor.biography || "No biography available."}
                    </p>
                </div>

                {/* Doctor Details */}
                <div className="space-y-6">
                    {[
                        { label: "Specialization", key: "specialization", icon: "🩺" },
                        { label: "Contact", key: "phoneNumber", icon: "📞" },
                        { label: "Email", key: "email", icon: "📧" },
                        { label: "Hospital", key: "hospital", icon: "🏥" },
                        { label: "Date of Birth", key: "dob", icon: "🎂", type: "date" },
                        { label: "NIC", key: "nic", icon: "🆔" },
                        { label: "Status", key: "status", icon: "📋" },
                    ].map(({ label, key, icon, type = "text" }) => (
                        <div key={key} className="flex items-start">
                            <span className="text-2xl bg-blue-100 text-blue-600 p-2 rounded-lg">
                                {icon}
                            </span>
                            <div className="ml-4 flex flex-col w-full">
                                <label className="text-sm font-medium text-gray-700">{label}</label>
                                {isEditable ? (
                                    <input
                                        type={type}
                                        name={key}
                                        value={doctor[key] || ""}
                                        onChange={handleChange}
                                        className="mt-1 p-2 border rounded-md focus:ring focus:ring-blue-200"
                                    />
                                ) : (
                                    <p className="mt-1 text-gray-800 text-lg">
                                        {doctor[key] || "N/A"}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                    {isEditable ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow-md transition justify-start"
                            >
                                Save
                            </button>
                            {/* <button
                                onClick={() => setIsEditable(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 shadow-md transition"
                            >
                                Cancel
                            </button> */}
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow-md transition justify-start"
                        >
                            Edit Details
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-md transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Popup Notification */}
            {showPopup && (
                <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-lg">
                    Profile updated successfully!
                </div>
            )}
        </div>
    );
};

export default DoctorProfile;
