import React, { useState, useEffect } from 'react';
import './Profile.css';
import { db } from '../../firebaseConfig'; // Firestore import
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth'; // Firebase auth for log out
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'; // Firebase Storage
import { useNavigate } from 'react-router-dom'; // For navigation

const Profile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    password: '',
    image: '', // Added field for storing the image URL
  });
  const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');
  const [selectedImage, setSelectedImage] = useState(null); // State for storing the selected image
  const [showPopup, setShowPopup] = useState(false); // Popup state for showing success message
  const [isLoading, setIsLoading] = useState(true); // State to track loading
  const navigate = useNavigate(); // Hook for navigation

  // Fetch the current logged-in user's profile from Firestore
  useEffect(() => {
    const fetchProfileData = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'webpatients', uid)); // Use UID as document ID
        if (userDoc.exists()) {
          console.log('User data:', userDoc.data());
          setProfile(userDoc.data());
          // Set the profile picture from the user's data, if available
          if (userDoc.data().image) {
            setProfilePicture(userDoc.data().image);
          }
        } else {
          console.log('No such user document!');
        }
      } catch (error) {
        console.error('Error fetching profile: ', error);
      } finally {
        setIsLoading(false); // Stop loading after fetching data
      }
    };

    // Get the current logged-in user
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid; // Use UID to fetch user data
      fetchProfileData(uid); // Fetch user profile by UID
    } else {
      navigate('/login'); // Navigate to login if no user
    }
  }, [navigate]);

  // Enable editing of the profile fields
  const handleEdit = () => {
    setIsEditable(true);
  };

  // Save profile data to Firestore and upload profile picture
  const handleSave = async () => {
    setIsEditable(false);
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      if (!user) throw new Error("No user is logged in");

      const userDocRef = doc(db, 'webpatients', user.uid); // Use UID as document ID

      // If an image is selected, upload it to Firebase Storage
      if (selectedImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${user.uid}`); // Create a reference for the image

        // Upload the image and get the download URL
        await uploadString(storageRef, selectedImage, 'data_url');
        const imageUrl = await getDownloadURL(storageRef); // Get the download URL

        // Update the profile object with the image URL
        const updatedProfile = { ...profile, image: imageUrl }; // Store the image in the 'image' field

        // Save updated profile to Firestore
        await setDoc(userDocRef, updatedProfile, { merge: true }); // Use UID for updating and merge to avoid overwriting existing fields
        console.log('Profile saved successfully with image!', updatedProfile);
      } else {
        // Save profile data to Firestore without image
        await setDoc(userDocRef, profile, { merge: true }); // Use UID for updating and merge
        console.log('Profile saved successfully without image!', profile);
      }

      // Show success popup
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false); // Hide the popup after 3 seconds
      }, 3000);

    } catch (error) {
      console.error('Error saving profile: ', error);
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle profile picture change
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result); // Update the profile picture
        setSelectedImage(reader.result); // Store the selected image for uploading
      };
      reader.readAsDataURL(file);
    }
  };

  // Log out the user and navigate to login page
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Sign out the user
      console.log('User signed out');
      navigate('/login'); // Navigate to the login page
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // If the profile data is still loading, display "Loading..."
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile-container">
      {/* Left Section */}
      <div className="user-profile-left">
        <div className="user-profile-picture-container">
          <img
            className="user-profile-picture"
            src={profilePicture}
            alt="Profile"
          />
          <label htmlFor="profile-picture-input" className="user-profile-picture-icon">
            <i className="fas fa-camera"></i>
          </label>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            style={{ display: 'none' }}
          />
        </div>
        <h1 className="user-profile-name">{profile.name || 'Loading...'}</h1>
      </div>

      {/* Right Section */}
      <div className="user-profile-right">
        <h2>Your Account</h2>

        <div className="user-profile-details">
          <div className="user-profile-field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              readOnly={!isEditable}
            />
          </div>

          <div className="user-profile-field">
            <label>Mobile</label>
            <input
              type="text"
              name="mobile"
              value={profile.mobile}
              onChange={handleChange}
              readOnly={!isEditable}
            />
          </div>

          <div className="user-profile-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              readOnly={!isEditable}
            />
          </div>

          <div className="user-profile-field">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              readOnly={!isEditable}
            />
          </div>

          <div className="user-profile-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              readOnly={!isEditable}
            />
          </div>
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
        </div>

        <div className="user-profile-logout">
          {/* Log Out Button */}
          <button className="user-profile-logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
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

export default Profile;
