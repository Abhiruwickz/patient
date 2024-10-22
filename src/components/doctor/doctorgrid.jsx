import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore'; 
import { getDownloadURL, ref } from 'firebase/storage'; 
import { getAuth } from 'firebase/auth'; // Import Firebase authentication
import { db, storage } from '../../firebaseConfig'; 
import './doctorgrid.css';
import Navbar from '../home/navbar/navbar';
import Footer from '../footer/footer';

const DoctorGrid = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(); // Get the authentication instance

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Doctors'));
        const doctorList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const specializationsSet = new Set(doctorList.map((doctor) => doctor.specialization));
        setSpecializations([...specializationsSet]);

        const doctorsWithImages = await Promise.all(
          doctorList.map(async (doctor) => {
            const imagePath = `doctors/${doctor.id}.jpg`; 
            try {
              const imageUrl = await getDownloadURL(ref(storage, imagePath));
              return { ...doctor, imageUrl };
            } catch (error) {
              console.error(`Error fetching image for ${doctor.id}:`, error);
              return { ...doctor, imageUrl: '/placeholder-image.png' }; 
            }
          })
        );

        setDoctors(doctorsWithImages);
        setFilteredDoctors(doctorsWithImages); 
      } catch (error) {
        console.error('Error fetching doctors data:', error);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedSpecialization === '') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter((doctor) => doctor.specialization === selectedSpecialization));
    }
  }, [selectedSpecialization, doctors]);

  const handleDoctorClick = (doctorId) => {
    const user = auth.currentUser; // Check if a user is logged in

    if (user) {
      navigate('/schedule', { state: { doctorId } }); // Navigate if user is authenticated
    } else {
      alert('Please log in to schedule an appointment.'); // Show alert if not authenticated
      navigate('/login'); // Redirect to the login page
    }
  };

  return (
    <>
      <Navbar />
      <div className="doctor-grid">
        <h2>Caring professionals, dedicated to your Medicare journey.</h2>
        <p>
          Guiding you with care, every step of the way on your Medicare journey. Our compassionate professionals are devoted to ensuring your healthcare experience is smooth, personalized, and empowering—because your well-being is our priority.
        </p>

        <div className="specialization-filter">
          <label htmlFor="specialization">Filter by specialization:</label>
          <select
            id="specialization"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p>{error}</p>
        ) : loading ? (
          <p>Loading doctors...</p>
        ) : (
          <div className="categories">
            {filteredDoctors.length > 0 ? (
              <div className="doctors">
                {filteredDoctors.map((doctor) => (
                  <div
                    className="doctor-card"
                    key={doctor.id}
                    onClick={() => handleDoctorClick(doctor.id)}
                  >
                    { <img src={doctor.photo || '/placeholder-image.png'} alt={doctor.name} /> }
                    <h4>{doctor.doctorName}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <p>No doctors available for the selected specialization.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default DoctorGrid;
