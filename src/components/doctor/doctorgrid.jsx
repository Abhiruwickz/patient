import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Doctors'));
        const doctorList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Extract unique specializations
        const specializationsSet = new Set(
          doctorList.map((doctor) => doctor.specialization)
        );
        setSpecializations([...specializationsSet]);

        // Handle image URLs for each doctor
        const doctorsWithImages = await Promise.all(
          doctorList.map(async (doctor) => {
            // Use the 'photo' field if available
            if (doctor.photo) {
              return { ...doctor, imageUrl: doctor.photo };
            }

            // Dynamically fetch from Firebase Storage if no 'photo' field exists
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
      setFilteredDoctors(
        doctors.filter(
          (doctor) => doctor.specialization === selectedSpecialization
        )
      );
    }
  }, [selectedSpecialization, doctors]);

  const handleDoctorClick = (doctorId) => {
    navigate('/schedule', { state: { doctorId } });
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Caring Professionals, Dedicated to Your Medicare Journey
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Guiding you with care, every step of the way on your Medicare
            journey. Our compassionate professionals are devoted to ensuring
            your healthcare experience is smooth, personalized, and
            empowering—because your well-being is our priority.
          </p>

          <div className="mb-6">
            <label
              htmlFor="specialization"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by specialization:
            </label>
            <select
              id="specialization"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
            <p className="text-center text-red-500">{error}</p>
          ) : loading ? (
            <p className="text-center text-gray-500">Loading doctors...</p>
          ) : (
            <div>
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-cover gap-6 mt-8 ">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-lg shadow-lg hover:shadow-xl cursor-pointer p-4 "
                      onClick={() => handleDoctorClick(doctor.id)}
                    >
                      <div className="w-full h-80 relative">
                        <img
                          src={doctor.imageUrl || '/placeholder-image.png'}
                          alt={doctor.name}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <h4 className="mt-4 text-lg font-semibold text-gray-800 text-center">
                        {doctor.doctorName}
                      </h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No doctors available for the selected specialization.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DoctorGrid;
